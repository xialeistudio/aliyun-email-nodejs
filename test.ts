/**
 * Created by Administrator on 2017/6/19.
 */
import {AliyunEmail} from './index';
const sdk = new AliyunEmail({
    accessKeyId: process.env.ALI_ACCESS_KEY,
    accessKeySecret: process.env.ALI_ACCESS_SECRET,
    accountName: process.env.ALI_ACCOUNT_NAME,
    fromAlias: process.env.ALI_FROM_ALIAS,
});

sdk.singleSend(process.env.TO_ADDRESS, '测试邮件', '<h1>测试</h1>').then(console.log).catch(console.error);