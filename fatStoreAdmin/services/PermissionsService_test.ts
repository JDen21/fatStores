// import Permissions from "./PermissionsService.ts";
// import { assertEquals } from "@std/assert";

// const permissionsService = new Permissions();
// Deno.test({
//   name: 'Can encode and decode a session.',
//   async fn () {
//     const sessionTok = await permissionsService.encodeSession(
//       {
//         sellerId: '123567'
//       },
//       {
//         iss: "FatStoreAdminApiTest",
//         sub: "FatStore access test.",
//         expiresIn: "3d",
//         jti: "0",
//         aud: "seller",
//       }
//     );
//     const decodedSess = permissionsService.decodeSession(sessionTok, {});
//     assertEquals(decodedSess, {});
//   }
// });
