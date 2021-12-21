import { all, put } from "redux-saga/effects";
import { apiCall, tryTakeEvery } from "./utils";
import { fetchOwner } from "services/api/entities";
import * as actions from "actions/owner";

function* isOwner({ accountAddress, communityAddress }) {
    const response = yield apiCall(fetchOwner, { accountAddress, communityAddress });
    yield put({
        type: actions.OWNERSHIP.SUCCESS,
        accountAddress,
        communityAddress,
        response,
    });
}

export default function* ownerSaga() {
    yield all([tryTakeEvery(actions.OWNERSHIP, isOwner, 1)]);
}