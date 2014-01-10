/**
 * ProjectTag
 *
 * @module      :: Model
 * @description :: Association between projects and tags (see Tag and Project models)
 *
 */

module.exports = {

  attributes: {
    // project that has a tag assigned to it
    projectId: 'INTEGER',
    // id of the tag
    tagId: 'INTEGER'
  }

};
