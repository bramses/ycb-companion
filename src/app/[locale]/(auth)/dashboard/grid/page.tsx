'use client';

// lazy load the ag-grid-react and its css
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AgGridReact } from 'ag-grid-react';
import { useCallback, useState } from 'react';

// TODO: Implement custom cell editor for JSON metadata validation
// const CustomMetadataEditor = (props: any) => {
//   const [metadata, setMetadata] = useState<string>('');
//   const textAreaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     const initialMetadata = JSON.stringify(JSON.parse(props.value), null, 4);
//     setMetadata(initialMetadata);
//   }, [props.value]);

//   useEffect(() => {
//     if (textAreaRef.current) {
//       textAreaRef.current.focus();
//     }
//   }, []);

//   const getGui = () => {
//     const div = document.createElement('div');
//     div.innerHTML = `<textarea style="width: 100%; height: 100%;">${metadata}</textarea>`;
//     return div;
//   };

//   const getValue = () => {
//     console.log('textAreaRef.current?.value:', textAreaRef.current?.value);
//     // return initial value if no change
//     return textAreaRef.current?.value || metadata;
//   };

//   return (
//     <div ref={getGui}>
//       <textarea
//         ref={textAreaRef}
//         style={{ width: '100%', height: '100%' }}
//         defaultValue={metadata}
//       />
//     </div>
//   );
// };

const Grid = () => {
  // const gridRef = useRef(null);
  const limit = 20;
  const [gridApi, setGridApi] = useState<any | null>(null);
  // const [gridKey] = useState(0);

  const onGridReady = useCallback(async (params: any) => {
    const dataList = await fetch(`/api/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        limit,
        sortModel: [{ colId: 'updatedAt', sort: 'desc' }],
        filterModel: { items: [] },
      }),
    });

    const dataRes = await dataList.json();
    const { data } = dataRes;

    console.log('Data received:', data);

    setGridApi(params.api);

    const dataSource = {
      rowCount: undefined,
      getRows: async (paramsRows: any) => {
        const currentPageNumber = Math.floor(paramsRows.endRow / limit);
        let lastRow = -1;
        let list = data;
        const { sortModel } = paramsRows;
        const { filterModel } = paramsRows;

        if (currentPageNumber !== -1) {
          let nextPageData = await fetch(`/api/list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              page: currentPageNumber,
              limit,
              sortModel,
              filterModel,
            }),
          });
          const nextPageDataRes = await nextPageData.json();
          nextPageData = nextPageDataRes.data;

          list = nextPageData;
        }

        // This line is very important to stop fetching more data
        // If current fetched data is lesser than the limit then that means
        // this is indeed the last page so we add it's length with the startRow
        // and that'd be our total row count
        if (list?.length < limit) {
          lastRow = (paramsRows?.startRow ?? 0) + (list?.length ?? 0);
        }

        if (list?.length) {
          paramsRows.successCallback(list, lastRow);
        } else {
          paramsRows.failCallback();
        }
      },
    };
    params.api.setGridOption('datasource', dataSource);
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);

  // function convertToCSV(data: any): string {
  //   const array = Array.isArray(data) ? data : [data];
  //   const keys = Object.keys(array[0]);
  //   const csvRows = array.map((row) =>
  //     keys.map((key) => JSON.stringify(row[key], replacer)).join(','),
  //   );
  //   return [keys.join(','), ...csvRows].join('\n');
  // }

  // // Optional: Custom replacer function to handle special cases
  // function replacer(key: string, value: any) {
  //   return value === null ? '' : value;
  // }

  async function downloadEntries() {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Add any necessary request body data here
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // const responseData = await response.json();
      // const csvData = convertToCSV(responseData);

      // const blob = new Blob([csvData], { type: 'text/csv' });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'entries.csv'; // Change the file extension to .csv
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
      // window.URL.revokeObjectURL(url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'entries.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    } finally {
      setIsDownloading(false);
    }
  }

  const deleteEntry = async (id: string) => {
    fetch(`/api/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));
  };

  const cellRenderer = (props: any) => {
    if (props?.value !== undefined) {
      return props.value;
    }
    return <img src="https://www.ag-grid.com/example-assets/loading.gif" />;
  };

  const getColumns = () => {
    return [
      {
        field: 'id',
        cellRenderer,
        checkboxSelection: true,
        width: 100,
      },
      {
        field: 'data',
        cellEditor: 'agLargeTextCellEditor',
        cellEditorParams: { maxLength: 5000 },
        cellEditorPopup: true,
        editable: true,
        onCellValueChanged: (params: any) => {
          const { metadata } = params.data;
          let parsedMetadata = metadata;
          try {
            parsedMetadata = JSON.parse(metadata);
          } catch (err) {
            console.error(err);
          }
          fetch(`/api/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: params.data.id,
              data: params.data.data,
              metadata: parsedMetadata,
            }),
          })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .then(() => gridApi.refreshInfiniteCache())
            .catch((error) => console.error('Error:', error));
        },
        sortable: false,
        suppressHeaderMenuButton: true,
        filter: true,
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'metadata',
        cellEditor: 'agLargeTextCellEditor',
        cellEditorParams: { maxLength: 5000 },
        // cellEditor: CustomMetadataEditor,
        cellEditorPopup: true,
        editable: true,
        onCellValueChanged: (params: any) => {
          console.log('changed params:', params);
          const { metadata } = params.data;
          let parsedMetadata = metadata;
          try {
            parsedMetadata = JSON.parse(metadata);
          } catch (err) {
            console.error(err);
          }
          fetch(`/api/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: params.data.id,
              data: params.data.data,
              metadata: parsedMetadata,
            }),
          })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .then(() => gridApi.refreshInfiniteCache())
            .catch((error) => console.error('Error:', error));
        },
        suppressHeaderMenuButton: true,
        sortable: false,
        filter: true,
      },
      {
        field: 'createdAt',
        suppressHeaderMenuButton: true,
        width: 100,
      },
      {
        field: 'updatedAt',
        suppressHeaderMenuButton: true,
        sortable: true,
        initialSort: 'desc' as 'asc' | 'desc' | undefined, // Updated line,
        width: 100,
      },
    ];
  };

  const [columns] = useState(getColumns());

  return (
    <div>
      <main>
        <div>
          <button
            type="button"
            onClick={() => {
              // if no row is selected then return
              if (!gridApi.getSelectedNodes().length) {
                return;
              }
              // ask for permission to delete
              const result = window.confirm(
                'Are you sure you want to delete this row?',
              );
              if (!result) {
                return;
              }
              const selectedNodes = gridApi.getSelectedNodes();
              const selectedData = selectedNodes.map((node: any) => node.data);
              console.log('selectedData:', selectedData);
              deleteEntry(selectedData[0].id);
              gridApi.refreshInfiniteCache();
            }}
          >
            Delete Selected Row
          </button>
          <div
            className="ag-theme-quartz" // applying the Data Grid theme
            style={{ width: '100%', height: '500px' }}
          >
            <AgGridReact
              // key={gridKey} // use key to force re-render the grid
              columnDefs={columns}
              rowModelType="infinite"
              onGridReady={onGridReady}
              cacheBlockSize={limit} // this make sure only rows equal to limit are fetched every time
              //   ref={gridRef}
              //   pagination={pagination}
              //   paginationPageSize={paginationPageSize}
              //   paginationPageSizeSelector={paginationPageSizeSelector}
              //   domLayout="autoHeight"
              // onGridReady={(params) => {
              //   gridRef.current.api.sizeColumnsToFit();
              // }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            downloadEntries();
            console.log('Downloading data...');
          }}
          disabled={isDownloading}
          className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {isDownloading ? 'Downloading...' : 'Download Data'}
        </button>
      </main>
    </div>
  );
};

export default Grid;
