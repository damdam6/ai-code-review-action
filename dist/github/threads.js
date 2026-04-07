import * as core from '@actions/core';
const MAX_PAGES = 10;
const THREADS_QUERY = `
  query($owner: String!, $repo: String!, $pr: Int!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100, after: $cursor) {
          pageInfo { hasNextPage, endCursor }
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            comments(last: 5) {
              nodes {
                databaseId
                body
                author { login }
              }
            }
          }
        }
      }
    }
  }
`;
const RESOLVE_MUTATION = `
  mutation($threadId: ID!) {
    resolveReviewThread(input: { threadId: $threadId }) {
      thread { id, isResolved }
    }
  }
`;
const toReviewThread = (node) => ({
    id: node.id,
    isResolved: node.isResolved,
    isOutdated: node.isOutdated,
    path: node.path,
    line: node.line ?? 0,
    comments: node.comments.nodes.map((c) => ({
        id: c.databaseId,
        body: c.body,
        author: c.author?.login ?? 'unknown',
    })),
});
export const getUnresolvedThreads = async (graphql, owner, repo, prNumber) => {
    const threads = [];
    let cursor = null;
    let page = 0;
    do {
        const data = await graphql(THREADS_QUERY, {
            owner,
            repo,
            pr: prNumber,
            cursor,
        });
        const connection = data.repository.pullRequest.reviewThreads;
        for (const node of connection.nodes) {
            if (!node.isResolved) {
                threads.push(toReviewThread(node));
            }
        }
        page++;
        if (page >= MAX_PAGES) {
            core.warning(`Reached max pagination limit (${MAX_PAGES} pages). Some threads may not be fetched.`);
            break;
        }
        cursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    } while (cursor);
    return threads;
};
export const resolveThread = async (graphql, threadId) => {
    await graphql(RESOLVE_MUTATION, { threadId });
};
export const filterBotThreads = (threads, botLogin) => threads.filter((t) => t.comments.some((c) => c.author === botLogin));
//# sourceMappingURL=threads.js.map