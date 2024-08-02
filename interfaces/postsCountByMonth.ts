interface IPostsCountByMonth {
    _id: {
        year: number
        month: number
    },
    count: number
}

export default IPostsCountByMonth