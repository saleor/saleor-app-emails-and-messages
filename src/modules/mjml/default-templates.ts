export const defaultOrderCreatedMjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hi!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been created. Below is the list of ordered products.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-table>
          <thead class="table-header-row">
            <tr>
              <th>
                  Billing address
              </th>
              <th>
                  Shipping address
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="address">
                {{#if order.billingAddress}}
                  {{ order.billingAddress.streetAddress1 }}
                {{else}}
                 No billing address
                {{/if}}
              </td>
              <td css-class="address">
                {{#if order.shippingAddress}}
                  {{ order.shippingAddress.streetAddress1}}
                {{else}}
                  No shipping required
                {{/if}}
              </td>
            </tr>
          </tbody>
        </mj-table>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

export const defaultOrderFulfilledMjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hi!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been fulfilled. Below is the list of ordered products.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-table>
          <thead class="table-header-row">
            <tr>
              <th>
                  Billing address
              </th>
              <th>
                  Shipping address
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="address">
                {{#if order.billingAddress}}
                  {{ order.billingAddress.streetAddress1 }}
                {{else}}
                 No billing address
                {{/if}}
              </td>
              <td css-class="address">
                {{#if order.shippingAddress}}
                  {{ order.shippingAddress.streetAddress1}}
                {{else}}
                  No shipping required
                {{/if}}
              </td>
            </tr>
          </tbody>
        </mj-table>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
