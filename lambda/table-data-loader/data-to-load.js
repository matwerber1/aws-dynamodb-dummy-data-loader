exports.items = [
  // SK = customer_data represents customer "header" information, such as name, etc.
  {
    pk: 'customer_1',
    sk: 'customer_data',
    name: 'Mat Werber',
    title: 'Solution Architect',
    company: 'AWS',
  },
  {
    pk: 'customer_2',
    sk: 'customer_data',
    name: 'Jane Werber',
    title: 'Solution Architect',
    company: 'AWS',
  },

  // SK = address_current represents customers currently-active address. Customer can
  // have multiple prior addresses, so the current_address attribute tells us what address 
  // is the most recent address. When a new address is added, we would:
  //  1. insert a new item with SK = address_X, where X is the next incremental value
  //  2. Update the item with SK = address_current so we can quickly look up the latest address without needing to know the proper version number
  //  3. Update the previous address to add a new end_date attribute, telling us when it was no longer the active address 
  {
    pk: 'customer_1',
    sk: 'address_current',
    street: '789 southern ave',
    city: 'Tempe',
    state: 'AZ',
    effective_date: '2020-09-10',
    current_version: 2
  },
  // As discussed above, this was customer 1's original address (no longer active)
  {
    pk: 'customer_1',
    sk: 'address_1',
    street: '456 second ave',
    city: 'Manhattan',
    state: 'NY',
    effective_date: '2020-01-01',
    end_date: '2020-09-10'
  },
  // As discussed above, this is the customer's second address, which happens to be the current address
  {
    pk: 'customer_1',
    sk: 'address_2',
    street: '789 southern ave',
    city: 'Tempe',
    state: 'AZ',
    effective_date: '2020-09-10',
  },
];