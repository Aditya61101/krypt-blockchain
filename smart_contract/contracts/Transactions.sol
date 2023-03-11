//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

//same as class in OOP
contract Transactions {
    //statically typed
    uint256 transactionCounter;
    // same as calling function with params
    event Transfer(
        address from,
        address receiver,
        uint amount,
        string message,
        uint256 timestamp,
        string keyword
    );
    struct TransferStruct {
        // type property;
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }
    //array of TransferStruct
    TransferStruct[] transactions;

    //function with visibility as public and returns nothing
    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCounter+=1;
        // push to array
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));
        // emit event
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    //function with visibility as public and returns an array of objects
    function getAllTransactions()
        public
        view
        returns (TransferStruct[] memory)
    {
        return transactions;
    }

    //function with visibility as public and returns an integer
    function getTransactionCount() public view returns (uint256) {
        return transactionCounter;
    }
}
