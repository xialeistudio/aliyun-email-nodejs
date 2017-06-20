# @xialeistudio/aliyun-email
aliyun email nodejs sdk, developed by typescript.

## get started
```
npm i @xialeistudio/aliyun-email
```

```typescript
import {AliyunEmail} from '@xialeistudio/aliyun-email';
const sdk = new AliyunEmail({
    accessKeyId: 'accessKeyId',
    accessKeySecret: 'accessKeySecret',
    accountName: 'accountName',
    fromAlias: 'fromAlias',
});

sdk.singleSend('test@exmail.com', 'test subject','<h1>test body</h1>').then(console.log).catch(console.error);
```