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
import {NextOnlineResponse} from '../model/NextOnlineResponse';
import {PublicKeysResponse} from '../model/PublicKeysResponse';
import {PublicRandomResponse} from '../model/PublicRandomResponse';
import {TimestampResponse} from '../model/TimestampResponse';


export class SatMetricsApi {

    
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }

    nextOnlineGetWithHttpInfo() {
      
      let postBody = null;

      let pathParams = {
        
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
      let returnType = NextOnlineResponse;

      return this.apiClient.callApi(
        '/next-online', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    nextOnlineGet() {
      return this.nextOnlineGetWithHttpInfo()
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    publicKeysGetWithHttpInfo() {
      
      let postBody = null;

      let pathParams = {
        
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
      let returnType = PublicKeysResponse;

      return this.apiClient.callApi(
        '/public-keys', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    publicKeysGet() {
      return this.publicKeysGetWithHttpInfo()
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    publicRandomGetWithHttpInfo() {
      
      let postBody = null;

      let pathParams = {
        
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
      let returnType = PublicRandomResponse;

      return this.apiClient.callApi(
        '/public-random', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    publicRandomGet() {
      return this.publicRandomGetWithHttpInfo()
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }
    timestampGetWithHttpInfo() {
      
      let postBody = null;

      let pathParams = {
        
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
      let returnType = TimestampResponse;

      return this.apiClient.callApi(
        '/timestamp', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
    timestampGet() {
      return this.timestampGetWithHttpInfo()
        .then(function(response_and_data) {
          return response_and_data.data;
        });
    }

}