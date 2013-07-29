/*---------------------
    :: TaskComment
    -> model
---------------------*/
module.exports = {

    attributes: {
        // task id for this comment 
        taskId: 'INTEGER',
        // user id of the person contributing the comment
        userId: 'INTEGER',
        // content of the comment
        comment: 'STRING'
    }

};
