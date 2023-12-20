import { GetServerSidePropsContext } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";

import Modal from 'react-modal';
import { toast } from "react-hot-toast";
import { RouterOutputs, api } from "~/utils/api";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';

type Payment = RouterOutputs["payment"]["getAll"][number];
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaCalendarAlt } from 'react-icons/fa';

const ViewPayment = (props: { payment: Payment }) => {
  const { name, amount, imgurl, date } = props.payment;
  const amountColor = amount < 0 ? 'text-red-500' : 'text-green-500';
  const ArrowIcon = amount < 0 ? FaArrowDown : FaArrowUp;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.payment.delete.useMutation({
    onSuccess: () => {
      void ctx.payment.getAll.invalidate();
      // Delete the viewpayment from the displayed html 

    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  const handleDelete = () => {
    mutate(props.payment.id);
  }

  const handleEdit = () => {
    // Open modal
  }

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white transform transition-transform duration-500 hover:scale-105">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-md" />
          <p className="text-md">{date.toDateString()}</p>
        </div>
        <div className="flex space-x-2">
          <FaEdit onClick={handleEdit} className="text-md cursor-pointer" />
          <FaTrash onClick={handleDelete} className="cursor-pointer text-red-500 text-md" />
        </div>
      </div>
      <div className="flex justify-center items-end">
        <div className="flex items-center space-x-2">
          <ArrowIcon className={`text-4xl ${amountColor}`} />
          <p className={`text-center text-6xl ${amountColor}`}>
            {Math.abs(amount)}
          </p>
          <p className={`text-center text-2xl ${amountColor} align-top`}>
            €
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-center text-2xl">{name}</p>
      </div>
    </div>
  );
};

const CreatePaymentModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div>
      <button className="text-white" onClick={() => setModalIsOpen(true)}>+ Add payment</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Create Payment"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // This will give you a black background with 75% opacity
          },
          content: {
            backgroundColor: 'transparent', // This will make the modal's background transparent
            margin: 'auto', // This will center the modal
            width: '50%',
            height: 'auto',
            border: 'none', // This will remove the border of the modal
          },
        }}
      >
        <CreatePayment />
      </Modal>
    </div>
  );
};

const CreatePayment = () => {
  // Give me the next auth user session 
  const { data: sessionData } = useSession();

  //create a input state of type payment
  const [payment, setPayment] = useState({
    amount: 0,
    date: new Date(),
    name: '',
    imgurl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Set the correct type of the input
    if (e.target.name === "amount") {
      setPayment({
        ...payment,
        [e.target.name]: parseInt(e.target.value)
      });
      // close modal

      return;
    }
    if (e.target.name === "date") {
      setPayment({
        ...payment,
        [e.target.name]: new Date(e.target.value)
      });
      return;
    }
    setPayment({
      ...payment,
      [e.target.name]: e.target.value
    });
  };
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.payment.create.useMutation({
    onSuccess: () => {
      void ctx.payment.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!sessionData) return null;

  return (

    <div className="flex flex-col w-full gap-3 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center">Create Payment</h1>
      <div className="flex flex-col gap-3">

        <div>
          <label className="block text-sm font-bold text-gray-700">Name:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="text" name="name" onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Amount:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="number" name="amount" onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Date:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="date" name="date" onChange={handleChange} />
        </div>
      </div>
      {!isPosting && (
        <button className="px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" onClick={() => mutate({ ...payment })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center mt-4 text-blue-500">
          Loading...
        </div>
      )}
    </div>
  );
};

// Function to calculate sum of payments
function calculateSum(payments: Payment[]) {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

// Function to group payments by month
function groupByMonth(payments: Payment[]) {
  return payments.reduce((groups: any, payment) => {
    const date = new Date(payment.date);
    const month = date.toLocaleString('default', { month: 'long' });

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(payment);

    return groups;
  }, {});
}

export default function Home() {

  const { data } = api.payment.getAll.useQuery();

  // In your component
  const groupedPayments = groupByMonth(data ?? []);
  console.log(data)
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Hi
          </h1>
          <CreatePaymentModal />
          <Accordion className="w-full">
            {Object.entries(groupedPayments).map(([month, payments]) => (
              <AccordionItem key={month}>
                <AccordionItemHeading className="bg-white rounded p-3 my-2">
                  <AccordionItemButton>
                    <span>{month}</span>
                    <span className="ml-3 text-sm text-gray-500 float-right">
                      {calculateSum(payments as Payment[])} €
                    </span>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {(payments as Payment[]).map((payment) => (
                      <ViewPayment key={payment.id} payment={payment} />
                    ))}
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </main>
    </>
  );
}

