import {error} from '@sveltejs/kit';
import products from '#lib/content/products.json';
export const entries = () => products.map((product) => ({ pattern: product.href.split('/').pop()! }));
export function load({params}){
 const product=products.find(product=>product.href.split('/').pop()===params.pattern);
 if(!product)error(404,'Product guide not found');
 return {product};
}
