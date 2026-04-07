const toSide = (value) => value === 'LEFT' ? 'LEFT' : 'RIGHT';
export const createReview = async (octokit, owner, repo, prNumber, comments, summary) => {
    await octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        body: summary,
        event: 'COMMENT',
        comments: comments.map((c) => ({
            path: c.path,
            line: c.line,
            body: c.body,
            side: c.side ?? 'RIGHT',
        })),
    });
};
export const getExistingBotComments = async (octokit, owner, repo, prNumber, botLogin) => {
    const comments = await octokit.paginate(octokit.pulls.listReviewComments, {
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
    });
    return comments
        .filter((c) => c.user?.login === botLogin)
        .map((c) => ({
        path: c.path,
        line: c.line ?? c.original_line ?? 0,
        body: c.body,
        side: toSide(c.side),
    }));
};
export const replyToComment = async (octokit, owner, repo, prNumber, commentId, body) => {
    await octokit.pulls.createReplyForReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        comment_id: commentId,
        body,
    });
};
//# sourceMappingURL=comments.js.map