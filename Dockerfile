FROM node:0.10-onbuild

# Expose environment variables
ENV BRANCH= \
  NEW_RELIC_APP_NAME= \
  NEW_RELIC_LICENSE_KEY= \
  LINKEDIN_CLIENT_ID= \
  LINKEDIN_CLIENT_SECRET= \
  LINKEDIN_CALLBACK_URL= \
  MYUSA_CLIENT_ID= \
  MYUSA_CLIENT_SECRET= \
  MYUSA_CALLBACK_URL= \
  MYUSA_CLIENT_ID= \
  MYUSA_CLIENT_SECRET= \
  AWS_ACCESS_KEY_ID= \
  AWS_SECRET_ACCESS_KEY= \
  EMAIL_HOST= \
  EMAIL_USER= \
  EMAIL_PASS= \
  EMAIL_SYSTEM_ADDRESS= \
  NOTIFICATIONS_CC= \
  NOTIFICATIONS_BCC= \
  DATASTORE=local \
  FILESTORE= \
  S3_BUCKET= \
  S3_PREFIX= \
  SAILS_LOG_LEVEL= \
  PORT=3000

# Run additional npm install scripts
RUN npm run init

# Make internal port available to host
EXPOSE 3000

# Start script
ENTRYPOINT ["./tools/docker-start.sh"]
