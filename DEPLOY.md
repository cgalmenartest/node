We deploy this application on Cloud Foundry using continuous deployment. The following branches map to Cloud Foundry applications

git branch | CF organization | CF space | CF application | public URL | notes
---|---|---|---|---|---
dev | open-opportunities | dev | openopps | https://openopps-test.18f.gov | A public testing service for the latest development code
staging | open-opportunities | staging | openopps | https://openopps-staging.18f.gov | A staging server for reviewing releases
master | open-opportunities | master | openopps | https://openopps.digitalgov.gov | The production instance of Open Opportunities (for federal employee use only)


## Deployment Process

All changes to the application should follow the [GitHub flow process](https://github.com/18F/midas/blob/dev/CONTRIBUTING.md) outlined in the CONTRIBUTING.md document, which consists of making branches for changes and submitting them as pull requests against the `dev` branch.

PRs that are merged into `dev` will go through [Travis](https://travis-ci.org/18F/midas/builds/) for continuous integration testing and deployment.

### Staging

New releases destained for production should be tagged following semver and pushed submitted as a pull request against the `staging` branch.

PRs that are merged into `staging` will go through [Travis](https://travis-ci.org/18F/midas/builds/) for continuous integration testing and deployment.

### Deploy to production

Once a release has been validated on staging, open a new PR for the release against `master`.

PRs that are merged into `dev` will go through [Travis](https://travis-ci.org/18F/midas/builds/) for continuous integration testing and deployment.


## Cloud Foundry configuration

Cloud Foundry applications read their settings from `env vars` set in manifest.yml files and user-provided services. Each CF space has a unique `env-openopps` user-provided service for storing sensitive `env vars`. If you have access to deploy to CF, you should have access to this service too.

To change values stored in the `env-openopps` service, see the [Cloud Foundry docs](https://docs.18f.gov).
