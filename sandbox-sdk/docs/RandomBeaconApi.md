# sandbox-sdk.RandomBeaconApi

All URIs are relative to *https://sandbox.api.cryptosat.io/v0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**randomnessGet**](RandomBeaconApi.md#randomnessGet) | **GET** /randomness | 

<a name="randomnessGet"></a>
# **randomnessGet**
> RandomnessResponse randomnessGet(opts)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.RandomBeaconApi();
let opts = { 
  'num': "num_example", // String | 
  'type': "float", // String | 
  'format': "dec" // String | 
};
apiInstance.randomnessGet(opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **num** | **String**|  | [optional] 
 **type** | **String**|  | [optional] [default to float]
 **format** | **String**|  | [optional] [default to dec]

### Return type

[**RandomnessResponse**](RandomnessResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

