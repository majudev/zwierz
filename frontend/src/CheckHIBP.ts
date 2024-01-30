import {createHash} from 'crypto';

/*export function genSha1(password: string): string {
	const shasum = createHash('sha1');
	shasum.update(password);
	return shasum.digest('hex').toUpperCase();
}*/

export async function genSha1(message: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(message);
	const hash = await crypto.subtle.digest('SHA-1', data);
	const hashstring = Array.from(new Uint8Array(hash)).map( x => x.toString(16).padStart(2,'0') ).join('').toUpperCase();
	return hashstring;
  }

async function check(password: string): Promise<boolean> {
	const shasum = await genSha1(password);
	const first5 = shasum.substring(0, 5);
	const ending = shasum.substring(5);
	const response = await fetch('https://api.pwnedpasswords.com/range/' + first5, {
		method: 'GET',
	});
	if(!response.ok) throw Error('couldn\'t contant Have I Been Pwned');
	const body = await response.text();
	if(body.indexOf(ending) < 0){
		return false;
	}
	return true;
}

export default check;