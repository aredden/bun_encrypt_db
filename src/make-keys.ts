import { writeFile } from 'fs/promises';
import { SodiumPlus } from 'sodium-plus';
let sod = await SodiumPlus.auto();
await sod.ensureLoaded();
const keyObject = await sod.crypto_box_keypair();
let pubKey_i = await sod.crypto_box_publickey(keyObject);
let privKey_i = await sod.crypto_box_secretkey(keyObject);
await writeFile('public_key.x25519.bin', pubKey_i.getBuffer());
await writeFile('private_key.x25519.bin', privKey_i.getBuffer());
