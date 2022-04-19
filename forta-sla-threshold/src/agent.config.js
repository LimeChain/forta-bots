const config = {
  contracts: {
    "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573": "Dispatcher",
    "0x61447385B019187daa48e91c55c02AF1F1f3F863": "Agent Registry",
    "0xbF2920129f83d75DeC95D97A879942cCe3DcD387": "Scanner Registry",
  },
  chainIds: [1, 137, 56, 43114, 42161, 10, 250],
  SLA_THRESHOLD: 0.4,
  scanners: [
    "0x8da226fd2f242128040a6b50f1dbbaefcbeae1e9",
    "0xd15b17dd5a40ec8e8dbd4b76670d322fe7624f6e",
    "0x8f70600365cbd4fa96eb26679efdd4cfe6b3d30d",
    "0xbd806b0fee2b3083641bdfa835900357201783ff",
    "0x93e8267289c2ff2c1c42a8362f0fc2d4e5a55c37",
    "0xfb4b8fb3d2944d0d8a0ca620eac7d1d767bd3932",
    "0xe870840564d7395cc0f267f23cd85fa498b07a58",
    "0x85a7b12ece694cc71c6077ebc185538019e4138b",
    "0x38140f034cbc621a346511b295ce35bff399ac3e",
    "0x120f4b639977c3cb13b8915eb4b24a7a19a7e682",
    "0x58ee631aaef6882a392da1c25486ee181ff1b7d5",
    "0xb0697be4e0ee8f18d741b5b1c940c4bcac9c7eb4",
    "0xbc9f286125e7dad9402a05c555028750fdda85bb",
    "0xaa64b99aed1b93e705b35f4a5ff2822871888b9d",
    "0xdec088fea5feab7dc17789a92bffc10393a769de",
  ],
};

module.exports = {
  config,
};
