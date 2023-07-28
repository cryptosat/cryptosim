# sandbox-sdk.DelayEncryptionApi

All URIs are relative to *https://sandbox.api.cryptosat.io/v0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**delayEncKeypairDelayPost**](DelayEncryptionApi.md#delayEncKeypairDelayPost) | **POST** /delay-enc-keypair/{delay} | 
[**delayEncKeypairsKeypairIdPrivateGet**](DelayEncryptionApi.md#delayEncKeypairsKeypairIdPrivateGet) | **GET** /delay-enc-keypairs/{keypair_id}/private | 
[**delayEncKeypairsKeypairIdPublicGet**](DelayEncryptionApi.md#delayEncKeypairsKeypairIdPublicGet) | **GET** /delay-enc-keypairs/{keypair_id}/public | 

<a name="delayEncKeypairDelayPost"></a>
# **delayEncKeypairDelayPost**
> KeypairResponse delayEncKeypairDelayPost(delay)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.DelayEncryptionApi();
let delay = "delay_example"; // String | 

apiInstance.delayEncKeypairDelayPost(delay).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **delay** | **String**|  | 

### Return type

[**KeypairResponse**](KeypairResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="delayEncKeypairsKeypairIdPrivateGet"></a>
# **delayEncKeypairsKeypairIdPrivateGet**
> PrivateKeyResponse delayEncKeypairsKeypairIdPrivateGet(keypairId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.DelayEncryptionApi();
let keypairId = "keypairId_example"; // String | 

apiInstance.delayEncKeypairsKeypairIdPrivateGet(keypairId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keypairId** | **String**|  | 

### Return type

[**PrivateKeyResponse**](PrivateKeyResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="delayEncKeypairsKeypairIdPublicGet"></a>
# **delayEncKeypairsKeypairIdPublicGet**
> PublicKeyResponse delayEncKeypairsKeypairIdPublicGet(keypairId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.DelayEncryptionApi();
let keypairId = "keypairId_example"; // String | 

apiInstance.delayEncKeypairsKeypairIdPublicGet(keypairId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keypairId** | **String**|  | 

### Return type

[**PublicKeyResponse**](PublicKeyResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

