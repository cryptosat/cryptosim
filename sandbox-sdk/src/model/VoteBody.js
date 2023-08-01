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
import {ApiClient} from '../ApiClient';

export class VoteBody {
  constructor() {
  }

  static constructFromObject(data, obj) {
    if (data) {
      obj = obj || new VoteBody();
      if (data.hasOwnProperty('encrypted_vote'))
        obj.encryptedVote = ApiClient.convertToType(data['encrypted_vote'], 'String');
    }
    return obj;
  }

  getEncryptedVote() {
    return this.encryptedVote;
  }

  setEncryptedVote(encryptedVote) {
    this.encryptedVote = encryptedVote;
  }

}

VoteBody.prototype.encryptedVote = undefined;
