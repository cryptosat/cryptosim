# sandbox-sdk.PrivateBallotApi

All URIs are relative to *https://sandbox.api.cryptosat.io/v0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ballotMinParticipantsPost**](PrivateBallotApi.md#ballotMinParticipantsPost) | **POST** /ballot/{min_participants} | 
[**ballotsBallotIdFinalizePost**](PrivateBallotApi.md#ballotsBallotIdFinalizePost) | **POST** /ballots/{ballot_id}/finalize | 
[**ballotsBallotIdGet**](PrivateBallotApi.md#ballotsBallotIdGet) | **GET** /ballots/{ballot_id} | 
[**ballotsBallotIdResultGet**](PrivateBallotApi.md#ballotsBallotIdResultGet) | **GET** /ballots/{ballot_id}/result | 
[**ballotsBallotIdVotePost**](PrivateBallotApi.md#ballotsBallotIdVotePost) | **POST** /ballots/{ballot_id}/vote | 

<a name="ballotMinParticipantsPost"></a>
# **ballotMinParticipantsPost**
> CreateBallotResponse ballotMinParticipantsPost(minParticipants)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.PrivateBallotApi();
let minParticipants = "minParticipants_example"; // String | 

apiInstance.ballotMinParticipantsPost(minParticipants).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **minParticipants** | **String**|  | 

### Return type

[**CreateBallotResponse**](CreateBallotResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="ballotsBallotIdFinalizePost"></a>
# **ballotsBallotIdFinalizePost**
> ballotsBallotIdFinalizePost(ballotId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.PrivateBallotApi();
let ballotId = "ballotId_example"; // String | 

apiInstance.ballotsBallotIdFinalizePost(ballotId).then(() => {
  console.log('API called successfully.');
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ballotId** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="ballotsBallotIdGet"></a>
# **ballotsBallotIdGet**
> GetBallotResponse ballotsBallotIdGet(ballotId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.PrivateBallotApi();
let ballotId = "ballotId_example"; // String | 

apiInstance.ballotsBallotIdGet(ballotId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ballotId** | **String**|  | 

### Return type

[**GetBallotResponse**](GetBallotResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="ballotsBallotIdResultGet"></a>
# **ballotsBallotIdResultGet**
> GetResultResponse ballotsBallotIdResultGet(ballotId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.PrivateBallotApi();
let ballotId = "ballotId_example"; // String | 

apiInstance.ballotsBallotIdResultGet(ballotId).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ballotId** | **String**|  | 

### Return type

[**GetResultResponse**](GetResultResponse.md)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="ballotsBallotIdVotePost"></a>
# **ballotsBallotIdVotePost**
> ballotsBallotIdVotePost(body, ballotId)



### Example
```javascript
import {sandbox-sdk} from 'sandbox-sdk';
let defaultClient = sandbox-sdk.ApiClient.instance;

// Configure API key authorization: RequestAuthorizer
let RequestAuthorizer = defaultClient.authentications['RequestAuthorizer'];
RequestAuthorizer.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//RequestAuthorizer.apiKeyPrefix = 'Token';

let apiInstance = new sandbox-sdk.PrivateBallotApi();
let body = new sandbox-sdk.VoteBody(); // VoteBody | 
let ballotId = "ballotId_example"; // String | 

apiInstance.ballotsBallotIdVotePost(body, ballotId).then(() => {
  console.log('API called successfully.');
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**VoteBody**](VoteBody.md)|  | 
 **ballotId** | **String**|  | 

### Return type

null (empty response body)

### Authorization

[RequestAuthorizer](../README.md#RequestAuthorizer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

