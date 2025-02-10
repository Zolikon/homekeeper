# HomeKeeper

## Stack

- NextJs 15
- AWS Amplify
- DynamoDB (via Amplify)

## Deployment

New commit to master will be built automatically
Deployed instance is private, publicly unaccessable

## Local setup

#### Setting up standbox in AWS

```bash
npx ampx sandbox
```

After development shut down the sandbox

```bash
npx ampx sandbox destroy
```

#### Running application

```bash
npm install
```

```bash
npm run dev
```
