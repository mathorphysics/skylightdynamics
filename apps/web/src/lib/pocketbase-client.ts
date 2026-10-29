import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '@/lib/pocketbase-url';

const POCKETBASE_API_URL = PUBLIC_POCKETBASE_URL;

const pocketbaseClient = new PocketBase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient, POCKETBASE_API_URL };
