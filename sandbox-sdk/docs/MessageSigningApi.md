# sandbox-sdk.MessageSigningApi

All URIs are relative to *https://sandbox.api.cryptosat.io/v0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**signMessagePost**](MessageSigningApi.md#signMessagePost) | **POST** /sign-message | 
[**signMessageStatusRequestUuidGet**](MessageSigningApi.md#signMessageStatusRequestUuidGet) | **GET** /sign-message/status/{request_uuid} | 

<a name="signMessagePost"></a>
# **signMessagePost**
> SignMessageResponse signMessagePost(body)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.MessageSigningApi();
let body = new sandbox-sdk.SignMessageBody(); // SignMessageBody | 

apiInstance.signMessagePost(body).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**SignMessageBody**](SignMessageBody.md)|  | 

### Return type

[**SignMessageResponse**](SignMessageResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="signMessageStatusRequestUuidGet"></a>
# **signMessageStatusRequestUuidGet**
> StatusResponse signMessageStatusRequestUuidGet(requestUuid)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.MessageSigningApi();
let requestUuid = "requestUuid_example"; // String | 

apiInstance.signMessageStatusRequestUuidGet(requestUuid).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **requestUuid** | **String**|  | 

### Return type

[**StatusResponse**](StatusResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

