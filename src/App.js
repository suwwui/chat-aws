import logo from "./logo.svg";
import "./App.css";

import React, { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import intlFormatDistance from "date-fns/intlFormatDistance";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { generateClient } from "aws-amplify/api";
import { createChat } from './graphql/mutations';
import { listChats, getChat } from "./graphql/queries";
import * as subscriptions from "./graphql/subscriptions";
Amplify.configure(awsconfig);
const client = generateClient()

// const newChat = await client.graphql({
//     query: createChat,
//     variables: {
//         input: {
// 		"text": "Lorem ipsum dolor sit amet",
// 		"email": "Lorem ipsum dolor sit amet"
// 	}
//     }
// });

//List all items
const allChats = await client.graphql({
    query: listChats
});
console.log(allChats);

// Get a specific item
const oneChat = await client.graphql({
    query: getChat,
    variables: { id: 'YOUR_RECORD_ID' }
});

//List all items
// const listUsers = await client.graphql({
//     query: listUsers
// });
// console.log(allChats);

function App({ user, signOut }) {
  //  const [chats, setChats] = React.useState([]);

  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const userEmail = user?.attributes?.email || "";
  const [users, setUsers] = useState([]); 

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const result = await client.graphql({
  //         query:listUsers,}); // Assuming listUsers fetches all users
  //       setUsers(listUsers.data.listUsers.items);
  //     } catch (err) {
  //       console.error("Error fetching users:", err);
  //     }
  //   };

  //   fetchUsers();
  //  }, []);

  // Fetch chat messages when the component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const allChats = await client.graphql({
          query: listChats,
        });
        console.log(allChats.data.listChats.items);
        setChats(allChats.data.listChats.items);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "") return; // Don't send empty messages

    try {
      await client.graphql({
        query: createChat,
        variables: {
          input: {
            text: message,
            email: userEmail,
          },
        },
      });
      setMessage(""); // Clear the input field
      // Re-fetch chats after sending a message
      const allChats = await client.graphql({
        query: listChats,
      });
      setChats(allChats.data.listChats.items);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  return (
    <div>
      <div className="flex justify-end px-4 py-2">
        <button
          type="button"
          className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>

      

      <div className="flex justify-center items-center h-screen w-full">
      
      <div className={`w-3/4 flex flex-col`}>
           {/* Displaying chat messages */}
          {chats
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((chat) => (
            <div key={chat.id} 
             className={`flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 w-3/4 my-2 ${
                  chat.email  && "self-end bg-gray-200" 
                }`}
                >
    
              <div>
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500">
                      <span className="font text-gray-900">
                        {chat.email.split("@")[0]}
                      </span>{" "}
                    </div>
                    <time
                      dateTime="2023-01-23T15:56"
                      className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                    >
                      {intlFormatDistance(new Date(chat.createdAt), new Date())}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{chat.text}</p>
                </div>
              </div>
          ))}
          
          <div>
            <div className="relative mt-2 flex items-center">
              <input
                type="text"
                name="message"
                id="message"
                onKeyUp={async (e) => {
                  if (e.key === "Enter") {
                    await client.graphql({
                      query: createChat,
                      variables: {
                        input: {
                          text: e.target.value,
                          email: userEmail,
                        },
                      },
                    });
                    e.target.value = "";
                  }
                }}
                className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                  Enter
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default withAuthenticator(App);
