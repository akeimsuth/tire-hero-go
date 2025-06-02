// // import React, { createContext, useContext } from "react";
// // import useSocket from "../socket"; // Import the socket hook

// // const SocketContext = createContext(null);

// // export const SocketProvider = ({ children }) => {
// //   const socket = useSocket();

// //   return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
// // };

// // export const useSocketContext = () => useContext(SocketContext);
// import React, { createContext, useContext, useEffect } from "react";
// import { getSocket } from "../socket";
// import { useAuth } from "@/context/AuthContext";

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//     const { user } = useAuth();
//   useEffect(() => {
//     const socket = getSocket();
//     if (user?.id) {
//       socket.connect();
//       if(user?.accountType == 'customer'){
//         socket.emit("join", { userId: user.id, role: "customer" });
//       }
//       if(user?.accountType == 'provider'){
//           socket.emit("join", { userId: user.id, role: "provider" });
//       }
//     //   socket.emit("join", { userId: user.id, role: "customer" });
//       socket.on("new_bid", (data) => console.log("Received bid:", data));
//       socket.on("new_bid", (data) => console.log("Received bid:", data));
      
//       socket.on("new_request", ()=>{});

//       // 3. Listen for “bid_selected” if this provider’s bid was chosen
//       socket.on("bid_selected", ()=>{});

//       // 4. Listen for “job_confirmed” if customer confirms job
//       socket.on("job_confirmed", ()=>{});

//       // 5. (Optional) If using `bid_expired`, listen for that too
//       socket.on("bid_expired", ()=>{});
//     }

//     return () => {
//       socket.off("new_bid");
//       socket.off("new_request");
//       socket.off("bid_selected");
//       socket.off("job_confirmed");
//       socket.off("bid_expired");

//     };
//   }, [user?.id]);

//   return <SocketContext.Provider value={getSocket()}>{children}</SocketContext.Provider>;
// };

// export const useSocket = () => useContext(SocketContext);