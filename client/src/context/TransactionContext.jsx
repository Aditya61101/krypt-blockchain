import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

//window.ethereum is injected by metamask
const { ethereum } = window;

const getEthereumContract = () => {
  //provider is the connection to the blockchain
  if (!ethereum) {
    alert("Make sure you have metamask!");
    return;
  }
  const provider = new ethers.providers.Web3Provider(ethereum);
  //signer is the account that is connected to the provider
  const signer = provider.getSigner();
  //contract is the instance of the contract
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  console.log({ transactionContract, provider, signer });
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionsCount, setTransactionsCount] = useState(
    localStorage.getItem("transactionsCount") || 0
  );
  const [transactions, setTransactions] = useState([]);
  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };
  const getAllTransactions = async () => {
    if(!ethereum) return alert("Make sure you have metamask!");
    try {
      const transactionContract = getEthereumContract();
      const availableTransactions = await transactionContract.getAllTransactions();
      console.log(availableTransactions);
      const structTransactions = availableTransactions.map((transaction) => (
        {
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          amount: parseInt(transaction.amount._hex)/(10 ** 18),
          keyword: transaction.keyword,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
        }
      ))
      setTransactions(structTransactions);
    } catch (error) {
      console.log(error);
    }
  }
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        alert("Make sure you have metamask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };
  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTranscationCount();
      window.localStorage.setItem("transactionsCount", transactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("Make sure you have metamask!");
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        return alert("Make sure you have metamask!");
      }
      // get the data from the form
      const { addressTo, amount, keyword, message } = formData;
      // get the contract
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 21000 GWEI, 0.000021 ETH
            value: parsedAmount._hex,
          },
        ],
      });
      // function made in Transaction.sol to add the transaction to the blockchain
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log("Transaction hash: ", transactionHash.hash);
      // wait for the transaction to be mined
      await transactionHash.wait();
      setIsLoading(false);
      console.log("Transaction mined!");
      const transactionCount = await transactionContract.getTranscationCount();
      setTransactionsCount(transactionCount.toNumber());
      window.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionExists();
  }, []);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        handleChange,
        formData,
        sendTransaction,
        transactions,
        isLoading,
        transactionsCount
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
