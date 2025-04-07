const starterPack = {
  name: 'test comment',
  description: 'test comment starter pack',
  entries: [
    {
      id: 1,
      data: 'hello world',
      metadata: {
        title: 'hello title',
        author: 'https://yourcommonbase.com/dashboard',
        alias_ids: [2, 3],
      },
    },
    {
      id: 2,
      data: 'hello world child',
      metadata: {
        title: 'hello title child',
        author: 'https://yourcommonbase.com/dashboard',
        parent_id: 1,
      },
    },
    {
      id: 3,
      data: 'hello world child sibling',
      metadata: {
        title: 'hello title child sibling',
        author: 'https://yourcommonbase.com/dashboard',
        parent_id: 1,
      },
    },
  ],
};

export default starterPack;
