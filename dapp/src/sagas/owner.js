import { all, put } from "redux-saga/effects";
import { apiCall, tryTakeEvery } from "./utils";
import { fetchOwner } from "services/api/entities";
import * as actions from "actions/owner";

function* isOwner({ communityAddress, account }) {
    const response = yield apiCall(fetchOwner, { communityAddress, account });
    yield put({
        type: actions.OWNERSHIP.SUCCESS,
        communityAddress,
        account,
        response
    });
}

export default function* ownerSaga() {
    yield all([tryTakeEvery(actions.OWNERSHIP, isOwner, 1)]);
}