export const MJML_DEFAULT_TEMPLATE = `
<mjml>
  <mj-head>
    <mj-include path="./shared/styles.mjml" />
  </mj-head>
  <mj-body>
    <mj-include path="./shared/header.mjml" />
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hi!
        </mj-text>
        <mj-text>
          Thank you for your order {{ order.number}}. Below is the list of ordered products.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-include path="./partials/_order_lines.mjml" />
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
    <mj-include path="./shared/footer.mjml" />
  </mj-body>
</mjml>`;
