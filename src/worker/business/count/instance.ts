import { Where } from "./where";
import { CountQuery } from "../../types";
import * as Select from '../select/index';
import { IDB_MODE } from "../../enums";
import { IError } from "../../interfaces";

export class Instance extends Where {

    constructor(query: CountQuery, onSuccess: (noOfRecord: number) => void, onError: (error: IError) => void) {
        super();
        this.onError = onError;
        this.onSuccess = onSuccess;
        this.query = query;
    }

    execute() {
        try {
            const getDataFromSelect = () => {
                const selectInstance = new Select.Instance(this.query as any,
                    (results) => {
                        this.resultCount = results.length;
                        this.onTransactionCompleted_();
                    }, this.onError);
                selectInstance.execute();
            };
            if (this.query.join == null) {
                if (this.query.where != null) {
                    if (this.query.where.or || this.isArray(this.query.where)) {
                        getDataFromSelect();
                    }
                    else {
                        this.initTransaction_();
                        this.goToWhereLogic();
                    }
                }
                else {
                    this.initTransaction_();
                    this.executeWhereUndefinedLogic();
                }
            }
            else {
                getDataFromSelect();
            }
        }
        catch (ex) {
            this.onExceptionOccured(ex, { tableName: this.query.from });
        }
    }

    private initTransaction_() {
        this.createTransaction([this.query.from], this.onTransactionCompleted_, IDB_MODE.ReadOnly);
        this.objectStore = this.transaction.objectStore(this.query.from);
    }
}