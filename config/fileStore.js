module.exports.fileStore = {
  service: 'local',

  local: {
    dirname: 'assets/uploads'
  }

  /**
   * Store files on AWS S3
   * Useful for multi-server hosting environments
   *
   * Set fileStore.service = 's3'
   *
   * Set credentials according `aws-sdk` instructions:
   * http://v.gd/aws_sdk_creds
   *
   * @bucket: s3 bucket to use
   * @prefix: prefix string / virtual path within bucket
   */

  // s3: {
  //   bucket: 'midas-filestore',
  //   prefix: 'assets/uploads'
  // }

};
