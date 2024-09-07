const Loading = () => {
  return (
    <div className="flex justify-center">
      <div
        role="status"
        className="my-4 max-w-md animate-pulse space-y-4 divide-y divide-gray-200 rounded border border-gray-200 p-4 shadow md:p-6 "
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300" />
            <div className="h-2 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300" />
            <div className="h-2 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300" />
            <div className="h-2 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300" />
            <div className="h-2 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div>
            <div className="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300" />
            <div className="h-2 w-32 rounded-full bg-gray-200" />
          </div>
          <div className="h-2.5 w-12 rounded-full bg-gray-300" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
