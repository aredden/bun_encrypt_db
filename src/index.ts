import * as Prisma from '@prisma/client';
import { Errorlike, Server, serve } from 'bun';
import { readFile } from 'fs/promises';
import isNil from 'lodash/isNil';
import { SodiumPlus, X25519PublicKey } from 'sodium-plus';
let sod = await SodiumPlus.auto();
await sod.ensureLoaded();
console.log('SOD loaded');

const pubkey_buffer = await readFile('public_key.x25519.bin', 'buffer');
const pubKey = new X25519PublicKey(Buffer.from(pubkey_buffer));

const prisma = new Prisma.PrismaClient({
	log: [
		{ emit: 'stdout', level: 'query' },
		{ emit: 'stdout', level: 'info' },
		{ emit: 'stdout', level: 'warn' },
		{ emit: 'stdout', level: 'error' },
	],
	errorFormat: 'pretty',
});

await prisma.$connect();

const insertData = async (data: string): Promise<boolean> => {
	let encrypted_data = await sod.crypto_box_seal(data, pubKey);
	console.log('encrypted_data length: ', encrypted_data.length);
	try {
		let ok = await prisma.jsonData.create({
			data: {
				data: encrypted_data.toString('base64'),
			},
		});
		console.log('Data inserted as b64: ', ok.createdAt, 'id', ok.id, 'len', ok.data.length);
		return typeof ok !== 'undefined' && !isNil(ok.id);
	} catch (e) {
		console.error('exception: ', e);
		return false;
	}
};

let _server = serve({
	fetch: async (req: Request, srv: Server) => {
		let url = new URL(req.url);
		console.log(url.pathname, req.method);
		if (req.method === 'POST' && url.pathname === '/api/post') {
			if (!req.body) {
				return new Response('error', {
					status: 400,
				});
			}
			let data = Buffer.from(await req.arrayBuffer()).toString();

			let ok = await insertData(data);

			if (ok) {
				return new Response('Successfully inserted data');
			}
			return new Response('Error inserting data, please try again later.. :(');
		}
		return new Response('RONG', {
			status: 404,
		});
	},
	port: 9234,
	error: async (err: Errorlike) => {
		console.error(err);
		return new Response('Error: ' + err.message, {
			status: 500,
		});
	},
});

console.log('Server started on port 9234');
