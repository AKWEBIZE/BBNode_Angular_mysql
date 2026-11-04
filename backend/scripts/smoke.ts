/**
 * End-to-end smoke test. Exercises every ported endpoint against a running
 * server and a seeded database, checking status codes and response shapes.
 *
 *   npm run dev          # in one terminal
 *   npm run smoke        # in another
 *
 * It is not a substitute for a real test suite — it is the pass that proves
 * the query layer works, which typechecking cannot.
 */
const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:8081/bigbisort-imp-exp';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  FAIL ${name}${detail === undefined ? '' : ` -> ${JSON.stringify(detail)}`}`);
  }
}

interface CallResult {
  status: number;
  body: any;
}

async function call(
  method: string,
  path: string,
  body?: unknown,
): Promise<CallResult> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* plain text response, e.g. /product/product_info */
  }
  return { status: res.status, body: parsed };
}

function section(title: string): void {
  console.log(`\n${title}`);
}

async function main(): Promise<void> {
  const stamp = Date.now();

  section('health and reference data');
  check('GET /health', (await call('GET', '/health')).body?.status === 'UP');
  const signTypes = await call('GET', '/common/sign-sign-types');
  check('GET /common/sign-sign-types', signTypes.body?.ADMIN === 'Admin', signTypes.body);
  const loginTypes = await call('GET', '/api/enquiry/login-types');
  check('GET /api/enquiry/login-types', Array.isArray(loginTypes.body) && loginTypes.body.length === 2);
  const info = await call('GET', '/product/product_info');
  check('GET /product/product_info', String(info.body).startsWith('Product added'));

  section('product and varieties');
  const added = await call('POST', '/product/add', [
    {
      productName: `Smoke Mango ${stamp}`,
      category: 'Fruits',
      subcategory: 'Tropical',
      description: 'Created by the smoke test',
      quantity: '42',
      varietiesRequestBeanList: [
        {
          varietyName: 'Alphonso',
          imageUrl: 'assets/alphonso.jpg',
          color: 'Golden',
          price_per_unit: '250',
          harvestDate: '2026-05-01T00:00:00.000Z',
        },
      ],
    },
  ]);
  const createdProduct = added.body?._embedded?.productResponseBeanList?.[0];
  check('POST /product/add returns HAL envelope', Boolean(createdProduct), added.body);
  check('product carries its varieties', createdProduct?.varietiesList?.length === 1);
  // These four were silently dropped by the Java builders.
  const v = createdProduct?.varietiesList?.[0];
  check('variety keeps imageUrl', v?.imageUrl === 'assets/alphonso.jpg', v);
  check('variety keeps color', v?.color === 'Golden', v);
  check('variety keeps price_per_unit', v?.price_per_unit === '250', v);
  check('variety keeps harvestDate', Boolean(v?.harvestDate), v);

  const dup = await call('POST', '/product/add', [{ productName: `Smoke Mango ${stamp}` }]);
  check('duplicate product rejected with 409', dup.status === 409, dup.body);

  const productId = createdProduct?.productId;
  const got = await call('GET', `/product/${productId}`);
  check('GET /product/{id}', got.body?.productId === productId, got.body);
  check('GET /product/{id} unknown id is 404', (await call('GET', '/product/00000000-0000-4000-8000-000000000000')).status === 404);

  const filtered = await call('POST', '/product/filter?page=0&size=5', { productName: 'Smoke Mango' });
  check('POST /product/filter finds it', (filtered.body?._embedded?.productResponseBeanList ?? []).length >= 1, filtered.body?.page);
  check('filter returns page metadata', typeof filtered.body?.page?.totalElements === 'number');

  const byCategory = await call('POST', '/product/filter', { category: 'Fruits' });
  check('filter by category works', (byCategory.body?._embedded?.productResponseBeanList ?? []).length >= 1);

  const byVariety = await call('POST', '/product/filter', { varieties: 'Alphonso' });
  check('filter by variety name works', (byVariety.body?._embedded?.productResponseBeanList ?? []).length >= 1, byVariety.body?.page);

  const noMatch = await call('POST', '/product/filter', { productName: 'definitely-no-such-product' });
  check('empty filter omits _embedded', noMatch.body?._embedded === undefined && noMatch.body?.page?.totalElements === 0);

  // A literal % must not act as a wildcard.
  const escaped = await call('POST', '/product/filter', { productName: '%' });
  check('percent is escaped, not a wildcard', escaped.body?.page?.totalElements === 0, escaped.body?.page);

  const varAdd = await call('POST', '/varieties/add', [{ productId, varietyName: `Smoke Variety ${stamp}` }]);
  check('POST /varieties/add', Boolean(varAdd.body?._embedded?.varietiesResponseBeanList?.[0]), varAdd.body);
  const varietyId = varAdd.body?._embedded?.varietiesResponseBeanList?.[0]?.varietyId;
  check('GET /varieties/{id} via query param', (await call('GET', `/varieties/x?varietiesId=${varietyId}`)).body?.varietyId === varietyId);
  check('GET /varieties/{id} via path', (await call('GET', `/varieties/${varietyId}`)).body?.varietyId === varietyId);
  const missingVariety = await call('GET', '/varieties/00000000-0000-4000-8000-000000000000');
  check('unknown variety returns {} not 404', missingVariety.status === 200 && Object.keys(missingVariety.body).length === 0, missingVariety.body);
  const varFilter = await call('POST', '/varieties/filter', { productId, varietyName: 'Smoke' });
  check('POST /varieties/filter', (varFilter.body?._embedded?.varietiesResponseBeanList ?? []).length >= 1, varFilter.body?.page);

  section('signup and login');
  const buyerName = `smokebuyer${stamp}`;
  const signup = await call('POST', '/auth/buyer/sign-up', {
    name: 'Smoke Buyer',
    userName: buyerName,
    email: `${buyerName}@example.com`,
    phone: `9${String(stamp).slice(-9)}`,
    city: 'Chennai',
    password: 'Test@1234',
  });
  check('POST /auth/buyer/sign-up', Boolean(signup.body?.buyerId), signup.body);

  const dupBuyer = await call('POST', '/auth/buyer/sign-up', {
    userName: buyerName,
    email: `${buyerName}@example.com`,
    phone: `9${String(stamp).slice(-9)}`,
    password: 'Test@1234',
  });
  check('duplicate buyer rejected with 409', dupBuyer.status === 409, dupBuyer.body);

  // Both depend on columns the Java signup never wrote.
  check('GET /buyer/exist-username is true', (await call('GET', `/buyer/exist-username?username=${buyerName}`)).body === true);
  check('GET /buyer/email-phone-exist is true', (await call('GET', `/buyer/email-phone-exist?email=${buyerName}@example.com`)).body === true);
  check('exist-username false for unknown', (await call('GET', '/buyer/exist-username?username=nobody-here')).body === false);

  const buyerLogin = await call('POST', '/buyer/sign-in', { userName: buyerName, password: 'Test@1234' });
  check('POST /buyer/sign-in succeeds', buyerLogin.body?.message === 'Login successfully', buyerLogin.body);
  const buyerId = buyerLogin.body?.buyerId;
  check('wrong password rejected', (await call('POST', '/buyer/sign-in', { userName: buyerName, password: 'wrong' })).status === 401);

  const login = await call('POST', '/auth/login', {
    username: buyerName,
    password: 'Test@1234',
    authenticationType: 'BUYER',
  });
  check('POST /auth/login issues a token', typeof login.body?.accessToken === 'string', login.body?.message);
  check('bad credentials give the invalid message', (await call('POST', '/auth/login', { username: buyerName, password: 'nope', authenticationType: 'BUYER' })).body?.message === 'Invalid username or password');

  const sellerName = `smokeseller${stamp}`;
  const sellerSignup = await call('POST', '/auth/seller/sign-up', {
    name: 'Smoke Seller',
    username: sellerName,
    email: `${sellerName}@example.com`,
    phone: `8${String(stamp).slice(-9)}`,
    address: '9 Real Address',
    city: 'Salem',
    password: 'Test@1234',
  });
  check('POST /auth/seller/sign-up', Boolean(sellerSignup.body?.sellerId), sellerSignup.body);
  check('seller status label is Pending', sellerSignup.body?.status === 'Pending', sellerSignup.body);
  // Java wrote the city into the address column.
  check('seller address is the submitted address', sellerSignup.body?.address === '9 Real Address', sellerSignup.body);

  const adminName = `smokeadmin${stamp}`;
  const adminSignup = await call('POST', '/auth/admin/sign-up', {
    name: 'Smoke Admin',
    userName: adminName,
    email: `${adminName}@example.com`,
    password: 'Test@1234',
  });
  check('POST /auth/admin/sign-up', adminSignup.body?.username === adminName, adminSignup.body);
  check('admin response never echoes a password', !('password' in (adminSignup.body ?? {})));

  check('seller sign-in rejects an empty body', (await call('POST', '/seller/sign-in', {})).status === 400);

  section('orders');
  const order = await call('POST', '/buyer-order/save', {
    buyerId,
    orderDate: '2026-11-01T00:00:00.000Z',
    paymentMethod: 'UPI',
    billingCompanyName: 'Smoke Traders',
    shippingName: 'Smoke Buyer',
    quantity: '7',
    estimationDateOfArrival: '2026-11-20',
    productIds: [productId],
  });
  const orderId = order.body?.orderId;
  check('POST /buyer-order/save', Boolean(orderId), order.body);
  check('order embeds buyer info', order.body?.buyerInfoBean?.buyerId === buyerId);
  check('order embeds its products', order.body?.productResponseBeanSet?.length === 1);

  check('GET /buyer-order/{id}', (await call('GET', `/buyer-order/${orderId}`)).body?.orderId === orderId);

  const orderFilter = await call('POST', '/buyer-order/filter?page=0&size=50', { buyerId });
  check('POST /buyer-order/filter by buyerId', (orderFilter.body?._embedded?.buyerOrderResponseBeanList ?? []).length >= 1, orderFilter.body?.page);

  // This filter could never match in the Java version.
  const byShipping = await call('POST', '/buyer-order/filter', { shippingName: 'Smoke' });
  check('filter by shippingName works', (byShipping.body?._embedded?.buyerOrderResponseBeanList ?? []).length >= 1, byShipping.body?.page);

  const byCompany = await call('POST', '/buyer-order/filter', { billingCompanyName: 'Smoke Traders' });
  check('filter by billingCompanyName works', (byCompany.body?._embedded?.buyerOrderResponseBeanList ?? []).length >= 1, byCompany.body?.page);

  const statusUpdate = await call('PUT', `/buyer-order/update/status/${orderId}?status=DELIVERED`);
  check('PUT update status', statusUpdate.body?.message?.includes('Status'), statusUpdate.body);
  check('status actually changed', (await call('GET', `/buyer-order/${orderId}`)).body?.orderStatus === 'DELIVERED');
  check('invalid status rejected', (await call('PUT', `/buyer-order/update/status/${orderId}?status=NOPE`)).status === 400);

  const counts = await call('GET', `/buyer-order/status/count?buyerId=${buyerId}`);
  check('GET /buyer-order/status/count', counts.body?.TotalOrders >= 1, counts.body);
  check('counts are keyed by status', counts.body?.buyerOrderStatusCounts?.DELIVERED >= 1, counts.body);
  check('status count without buyerId works', (await call('GET', '/buyer-order/status/count')).body?.TotalOrders >= 1);

  section('watch list');
  const wlAdd = await call('POST', '/watch-list/add', { buyerId, productId });
  check('POST /watch-list/add', Boolean(wlAdd.body?.message), wlAdd.body);
  await call('POST', '/watch-list/add', { buyerId, productId });
  const ids = await call('GET', `/watch-list/ids?buyerId=${buyerId}`);
  check('adding twice stays idempotent', Array.isArray(ids.body) && ids.body.filter((i: string) => i === productId).length === 1, ids.body);

  // Impossible in the Java schema: @OneToOne made product_id unique.
  const otherBuyer = await call('POST', '/auth/buyer/sign-up', {
    userName: `${buyerName}b`,
    email: `${buyerName}b@example.com`,
    phone: `7${String(stamp).slice(-9)}`,
    password: 'Test@1234',
  });
  const secondAdd = await call('POST', '/watch-list/add', { buyerId: otherBuyer.body?.buyerId, productId });
  check('a second buyer can watch the same product', secondAdd.status === 200, secondAdd.body);

  const wlFilter = await call('POST', '/watch-list/filter?page=0&size=50', { buyerId });
  check('POST /watch-list/filter', (wlFilter.body?._embedded?.watchListResponseBeanList ?? []).length >= 1, wlFilter.body?.page);
  check('watch list embeds the product', Boolean(wlFilter.body?._embedded?.watchListResponseBeanList?.[0]?.productResponseBeans));

  const removed = await call('DELETE', `/watch-list/remove?buyerId=${buyerId}&productId=${productId}`);
  check('DELETE /watch-list/remove', Boolean(removed.body?.message), removed.body);
  check('removal took effect', !((await call('GET', `/watch-list/ids?buyerId=${buyerId}`)).body ?? []).includes(productId));

  section('contact and enquiry');
  const contact = await call('POST', '/contact/save-contact-info', {
    name: 'Smoke Tester',
    email: 'smoke@example.com',
    message: 'Hello from the smoke test',
    phoneNumber: '9000000009',
    city: 'Coimbatore',
  });
  check('POST /contact/save-contact-info', Boolean(contact.body?.contactId), contact.body);
  check('short name rejected', (await call('POST', '/contact/save-contact-info', { name: 'ab', email: 'a@b.com', message: 'hi' })).status === 400);

  const enquiry = await call('POST', '/api/enquiry', {
    topic: 'Farmer Support',
    name: 'Smoke Enquirer',
    email: 'enquiry@example.com',
    loginType: 'SELLER',
    contactNumber: '9000000010',
    state: 'Tamil Nadu',
    district: 'Erode',
    comments: 'Please call me back',
  });
  check('POST /api/enquiry', Boolean(enquiry.body?.message), enquiry.body);
  check('enquiry rejects a bad email', (await call('POST', '/api/enquiry', { name: 'x', email: 'nope', loginType: 'BUYER' })).status === 400);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('failed checks:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('smoke test crashed:', err);
  process.exitCode = 1;
});
