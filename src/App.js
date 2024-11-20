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

const allChats = await client.graphql({
  query: listChats
});
console.log(allChats);


const oneChat = await client.graphql({
  query: getChat,
  variables: { id: 'YOUR_RECORD_ID' }
});

// const user = await Auth.signIn(email, password)

function extractUsername(email) {
  return email.split("@")[0];
}

function App({ user, signOut }) {
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const userEmail = user?.signInDetails?.loginId || "No email found";


  // Fetch chat messages when the component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const allChats = await client.graphql({
          query: listChats,
        });
        setChats(allChats.data.listChats.items);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
    // Set up subscription for real-time updates
    const subscription = client
      .graphql({
        query: subscriptions.onCreateChat,
      })
      .subscribe({
        next: (newChatData) => {
          if (newChatData && newChatData.value && newChatData.value.data) {
            const newChat = newChatData.value.data.onCreateChat;
            setChats((prevChats) => [...prevChats, newChat]);
          } else {
            console.error("Subscription data is missing:", newChatData);
          }
        },
        error: (error) => console.warn("Subscription error:", error),
      });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);




  const handleSendMessage = async () => {
    if (message.trim() === "") return;

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
      setMessage(" ");
      // Re-fetch chats after sending a message
      const allChats = await client.graphql({
        query: listChats,
      });
      setChats(allChats.data.listChats.items);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const uniqueEmails = [...new Set(chats.map(chat => chat.email))];

  return (
    <div>
      
      <nav class="bg-teal-700 border-gray-200 px-4 lg:px-6 py-2.5 fixed top-0 left-0 w-full  border-b border-gray-200" style={{ height: '64px' }}>
        <div class="flex flex-wrap justify-between items-center ">
        <div class="flex justify-start items-center">
          <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
            <svg className="w-6 h-6 text-gray-800 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z" clipRule="evenodd" />
            </svg>
            <span class="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-white">ChatRoom</span>
          </a>
          </div>
        <div class="flex items-center space-x-6 rtl:space-x-reverse">
            <div className="flex items-center mr-4">
              <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                {userEmail.split("@")[0].charAt(0).toUpperCase()} 
              </div>
              
            </div>
            <button
              type="button"
                 className="relative inline-flex justify-center gap-x-1.5 ml-4 px-4 py-2 bg-rose-500 font-semibold text-white rounded hover:bg-rose-700"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
          
      </nav>





      <aside id="default-sidebar" class="fixed left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div class="h-full px-3 py-4 overflow-y-auto bg-gray-200 dark:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-200">
          <ul class="space-y-2 font-medium">
            <li>
              <a href="#" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                </svg>

                <span class="ms-3">Active User</span>
              </a>
            </li>
            {uniqueEmails.map((email, index) => (
              <li key={index}>
                <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
                  <span className="flex-1 ms-3 whitespace-nowrap">{extractUsername(email)}</span>
                </a>
              </li>

            ))}
          </ul>
        </div>
      </aside>
      <div class="p-4 sm:ml-64 mt-16">

        <div className={`flex flex-col p-6 border-2 border-gray-200 mt-5`}>
          <div class="flex items-center justify-center rounded bg-gray-50 "></div>

          <div />
          {/* Displaying chat messages */}
          {chats
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((chat) => (
              <div key={chat.id}
                className={`flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200 w-3/4 my-2 ${chat.email === userEmail ? "self-end bg-teal-100" : "bg-white"
                  }`}
              >

                <div>
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-gray-500 ">
                      <span className="font text-gray-900">
                        {extractUsername(chat.email)}
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
            <div className="relative mt-2 mb-3 flex items-center">

              <input
                type="text"
                name="message"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={async (e) => {
                  if (e.key === "Enter") {
                    await handleSendMessage();
                  }
                }}
                placeholder="  type a message..."

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
    </div >
  );
}


export default withAuthenticator(App);