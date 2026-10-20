import express from "express";
import carbonaccountController from "../controllers/carbonaccountController.js";

const Router = express.Router();

Router.route("/carbonaccount")
  .get(carbonaccountController.getAllAccounts)
  .post(carbonaccountController.createAccount);

Router.route("/carbonaccount/:id") // <-- this defines an endpoint with a "placeholder" for the id
  .get(carbonaccountController.getAccountById)
  .put(carbonaccountController.updateAccountById)
  .delete(carbonaccountController.deleteAccountById);

export default Router;