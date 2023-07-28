/*
 * Cryptosat Sandbox
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 3.0.46
 *
 * Do not edit the class manually.
 *
 */
import {ApiClient} from "../ApiClient";
import {CreateBallotResponse} from '../model/CreateBallotResponse';
import {GetBallotResponse} from '../model/GetBallotResponse';
import {GetResultResponse} from '../model/GetResultResponse';
import {VoteBody} from '../model/VoteBody';


export class PrivateBallotApi {

    
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }

    ballotMinParticipantsPostWithHttpInfo(minParticipants) {
      
      let postBody = null;
      // verify the required parameter 'minParticipants' is set
      if (minParticipants === undefined || minParticipants === null) {
        throw new Error("Missing the required parameter 'minParticipants' when calling ballotMinParticipantsPost");
      }

      let pathParams = {
        'min_participants': minParticipants
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = ['RequestAuthorizer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = CreateBallotResponse;

      return this.apiClient.callApi(
        '/ballot/{min_participants}', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    ballotMinParticipantsPost(minParticipants) {
      return this.ballotMinParticipantsPostWithHttpInfo(minParticipants)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    ballotsBallotIdFinalizePostWithHttpInfo(ballotId) {
      
      let postBody = null;
      // verify the required parameter 'ballotId' is set
      if (ballotId === undefined || ballotId === null) {
        throw new Error("Missing the required parameter 'ballotId' when calling ballotsBallotIdFinalizePost");
      }

      let pathParams = {
        'ballot_id': ballotId
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = ['RequestAuthorizer'];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/ballots/{ballot_id}/finalize', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    ballotsBallotIdFinalizePost(ballotId) {
      return this.ballotsBallotIdFinalizePostWithHttpInfo(ballotId)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    ballotsBallotIdGetWithHttpInfo(ballotId) {
      
      let postBody = null;
      // verify the required parameter 'ballotId' is set
      if (ballotId === undefined || ballotId === null) {
        throw new Error("Missing the required parameter 'ballotId' when calling ballotsBallotIdGet");
      }

      let pathParams = {
        'ballot_id': ballotId
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = ['RequestAuthorizer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = GetBallotResponse;

      return this.apiClient.callApi(
        '/ballots/{ballot_id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    ballotsBallotIdGet(ballotId) {
      return this.ballotsBallotIdGetWithHttpInfo(ballotId)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    ballotsBallotIdResultGetWithHttpInfo(ballotId) {
      
      let postBody = null;
      // verify the required parameter 'ballotId' is set
      if (ballotId === undefined || ballotId === null) {
        throw new Error("Missing the required parameter 'ballotId' when calling ballotsBallotIdResultGet");
      }

      let pathParams = {
        'ballot_id': ballotId
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = ['RequestAuthorizer'];
      let contentTypes = [];
      let accepts = ['application/json'];
      let returnType = GetResultResponse;

      return this.apiClient.callApi(
        '/ballots/{ballot_id}/result', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    ballotsBallotIdResultGet(ballotId) {
      return this.ballotsBallotIdResultGetWithHttpInfo(ballotId)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    ballotsBallotIdVotePostWithHttpInfo(body, ballotId) {
      
      let postBody = body;
      // verify the required parameter 'body' is set
      if (body === undefined || body === null) {
        throw new Error("Missing the required parameter 'body' when calling ballotsBallotIdVotePost");
      }
      // verify the required parameter 'ballotId' is set
      if (ballotId === undefined || ballotId === null) {
        throw new Error("Missing the required parameter 'ballotId' when calling ballotsBallotIdVotePost");
      }

      let pathParams = {
        'ballot_id': ballotId
      };
      let queryParams = {
        
      };
      let headerParams = {
        
      };
      let formParams = {
        
      };

      let authNames = ['RequestAuthorizer'];
      let contentTypes = ['application/json'];
      let accepts = [];
      let returnType = null;

      return this.apiClient.callApi(
        '/ballots/{ballot_id}/vote', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    ballotsBallotIdVotePost(body, ballotId) {
      return this.ballotsBallotIdVotePostWithHttpInfo(body, ballotId)
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }

}