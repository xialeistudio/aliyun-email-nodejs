/**
 * aliyun email nodejs sdk.
 * @author xialeistduio <https://github.com/xialeistudio>
 * @licence MIT
 * @see https://help.aliyun.com/document_detail/29414.html
 */
import fetch from "node-fetch";
import * as crypto from "crypto";
import * as moment from "moment";
import * as uuid from "uuid";
import * as qs from "querystring";

interface SdkOptions {
    accessKeyId: string;
    accessKeySecret: string;
    accountName: string;
    fromAlias: string;
    version?: string;
    regionId?: string;
    baseURL?: string;
}

interface RequestOptions {
    Format?: string;
    Version?: string;
    AccessKeyId?: string;
    SignatureMethod?: string;
    Timestamp?: string;
    SignatureVersion?: string;
    SignatureNonce?: string;
    Action: string;
    AccountName?: string;
    ReplyToAddress?: boolean;
    AddressType?: number;
    ToAddress?: string;
    Subject?: string;
    HtmlBody?: string;
    TextBody?: string;
    FromAlias?: string;
    RegionId?: string;
    Signature?: string;
    TemplateName?: string;
    ReceiversName?: string;
    TagName?: string;
}

export interface Response {
    HostId?: string;
    RequestId: string;
    Message?: string;
    Code?: string;
}

export class ResponseError extends Error {
    public requestId: string;
    public hostId: string;
    public code: string;

    constructor(message: string, code: string, requestId: string, hostId: string) {
        super(message);
        this.code = code;
        this.requestId = requestId;
        this.hostId = hostId;
    }
}

export class AliyunEmail {
    private accessKeyId: string;
    private accessKeySecret: string;
    private accountName: string;
    private fromAlias: string;
    private version = '2015-11-23';
    private regionId = 'cn-hanzhou';
    private baseURL = 'https://dm.aliyuncs.com';

    /**
     * constructor an instance
     * @param options
     */
    constructor(options: SdkOptions) {
        this.accessKeyId = options.accessKeyId;
        this.accessKeySecret = options.accessKeySecret;
        this.accountName = options.accountName;
        this.fromAlias = options.fromAlias;
        this.version = options.version || this.version;
        this.regionId = options.regionId || this.regionId;
        this.baseURL = options.baseURL || this.baseURL;
    }

    /**
     * hmacsha1 crypto
     * @param data
     * @returns {string}
     */
    private hmacsha1(data: Buffer | string): string {
        return crypto.createHmac('sha1', `${this.accessKeySecret}&`).update(data).digest().toString('base64');
    }

    /**
     * sign a request
     * @param data
     * @returns {string}
     */
    private signRequest(data: any): string {
        const keys = Object.keys(data).sort();
        let allSignString = `POST&${encodeURIComponent('/')}&`;
        let signString = '';
        keys.forEach(key => {
            signString += `&${key}=${encodeURIComponent(data[key])}`;
        });
        signString = signString.substr(1, signString.length);
        allSignString += encodeURIComponent(signString);
        return this.hmacsha1(allSignString);
    }

    /**
     * prepare request parameters
     * @param options
     * @returns {RequestOptions}
     */
    private prepareRequest(options: RequestOptions) {
        options.Format = options.Format || 'JSON';
        options.Version = options.Version || this.version;
        options.AccessKeyId = options.AccessKeyId || this.accessKeyId;
        options.SignatureMethod = options.SignatureMethod || 'HMAC-SHA1';
        options.SignatureVersion = options.SignatureVersion || '1.0';
        options.AccountName = options.AccountName || this.accountName;
        options.ReplyToAddress = options.ReplyToAddress || false;
        options.AddressType = options.AddressType || 1;
        options.FromAlias = options.FromAlias || this.fromAlias;
        options.RegionId = options.RegionId || this.regionId;
        options.Version = options.Version || this.version;

        const nonce = uuid.v4();
        const timestamp = moment().subtract(moment().utcOffset(), 'minutes').format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        options.SignatureNonce = nonce;
        options.Timestamp = timestamp;
        options.Signature = this.signRequest(options);
        return options;
    }

    /**
     * send to an email
     * @param toAddress
     * @param subject
     * @param body
     * @param isHtml
     * @returns {Promise<Response>}
     */
    public async singleSend(toAddress: string, subject: string, body: string, isHtml: boolean = true): Promise<Response> {
        let options: RequestOptions = {
            Action: 'SingleSendMail',
            ToAddress: toAddress,
            Subject: subject,
        };
        if (isHtml) {
            options.HtmlBody = body;
        } else {
            options.TextBody = body;
        }
        options = this.prepareRequest(options);
        const response = await fetch(this.baseURL, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            method: 'POST',
            body: qs.stringify(options)
        });
        const data = await response.json();
        if (data.Code !== undefined) {
            throw new ResponseError(data.Message, data.Code, data.RequestId, data.HostId);
        }
        return data;
    }

    /**
     * send to many email
     * @returns {Promise<Response>}
     * @param receiversName
     * @param templateName
     * @param tagName
     */
    public async batchSend(receiversName: string, templateName: string, tagName?: string): Promise<Response> {
        let options: RequestOptions = {
            Action: 'BatchSendMail ',
            TemplateName: templateName,
            ReceiversName: receiversName
        };
        if (tagName) {
            options.TagName = tagName;
        }
        options = this.prepareRequest(options);
        const response = await fetch(this.baseURL, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            method: 'POST',
            body: qs.stringify(options)
        });
        const data = await response.json();
        if (data.Code !== undefined) {
            throw new ResponseError(data.Message, data.Code, data.RequestId, data.HostId);
        }
        return data;
    }
}