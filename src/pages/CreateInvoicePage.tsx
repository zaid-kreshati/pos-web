import React from 'react';
import { Layout } from '../components/Layout';
import { InvoiceForm } from '../components/InvoiceForm';

export const CreateInvoicePage: React.FC = () => {
  return (
    <Layout>
      <InvoiceForm />
    </Layout>
  );
};
