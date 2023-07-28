# sandbox-sdk.SatMetricsApi

All URIs are relative to *https://sandbox.api.cryptosat.io/v0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**nextOnlineGet**](SatMetricsApi.md#nextOnlineGet) | **GET** /next-online | 
[**publicKeysGet**](SatMetricsApi.md#publicKeysGet) | **GET** /public-keys | 
[**publicRandomGet**](SatMetricsApi.md#publicRandomGet) | **GET** /public-random | 
[**timestampGet**](SatMetricsApi.md#timestampGet) | **GET** /timestamp | 

<a name="nextOnlineGet"></a>
# **nextOnlineGet**
> NextOnlineResponse nextOnlineGet()



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.SatMetricsApi();
apiInstance.nextOnlineGet().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**NextOnlineResponse**](NextOnlineResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="publicKeysGet"></a>
# **publicKeysGet**
> PublicKeysResponse publicKeysGet()



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.SatMetricsApi();
apiInstance.publicKeysGet().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PublicKeysResponse**](PublicKeysResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="publicRandomGet"></a>
# **publicRandomGet**
> PublicRandomResponse publicRandomGet()



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.SatMetricsApi();
apiInstance.publicRandomGet().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PublicRandomResponse**](PublicRandomResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="timestampGet"></a>
# **timestampGet**
> TimestampResponse timestampGet()



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.SatMetricsApi();
apiInstance.timestampGet().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**TimestampResponse**](TimestampResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

