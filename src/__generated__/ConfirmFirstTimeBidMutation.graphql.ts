/* tslint:disable */

import { ConcreteRequest } from "relay-runtime";
export type ConfirmFirstTimeBidMutationVariables = {
    readonly input: {
        readonly sale_id?: string;
        readonly artwork_id?: string;
        readonly max_bid_amount_cents?: number;
        readonly clientMutationId: string | null;
    };
};
export type ConfirmFirstTimeBidMutationResponse = {
    readonly createBidderPosition: ({
        readonly result: ({
            readonly position: ({
                readonly id: string;
            }) | null;
            readonly status: string;
            readonly message_header: string | null;
            readonly message_description_md: string | null;
        }) | null;
    }) | null;
};



/*
mutation ConfirmFirstTimeBidMutation(
  $input: BidderPositionInput!
) {
  createBidderPosition(input: $input) {
    result {
      position {
        id
        __id
      }
      status
      message_header
      message_description_md
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "BidderPositionInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "createBidderPosition",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input",
        "type": "BidderPositionInput!"
      }
    ],
    "concreteType": "BidderPositionPayload",
    "plural": false,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "result",
        "storageKey": null,
        "args": null,
        "concreteType": "BidderPositionMutationResult",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "position",
            "storageKey": null,
            "args": null,
            "concreteType": "BidderPosition",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "id",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "__id",
                "args": null,
                "storageKey": null
              }
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "status",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "message_header",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "message_description_md",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "ConfirmFirstTimeBidMutation",
  "id": "6a073f0aebdf4afc730ee8112d7b5e71",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ConfirmFirstTimeBidMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "ConfirmFirstTimeBidMutation",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
(node as any).hash = '88876a3b4a10047624b1c25dcde9ebdd';
export default node;
