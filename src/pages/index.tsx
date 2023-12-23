import { GetServerSidePropsContext } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

import Modal from 'react-modal';
import { toast } from "react-hot-toast";
import { RouterOutputs, api } from "~/utils/api";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';

type Payment = RouterOutputs["payment"]["getAll"][number];
type PaymentSchedule = RouterOutputs["paymentSchedule"]["getAll"][number];

import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaCalendarAlt, FaClock } from 'react-icons/fa';
interface UpdatePaymentScheduleProps {
  _paymentSchedule: PaymentSchedule;
  onPaymentUpdate: () => void;
}


const UpdatePaymentSchedule = ({ _paymentSchedule, onPaymentUpdate }: UpdatePaymentScheduleProps) => {
  // Give me the next auth user session 
  const { data: sessionData } = useSession();

  //wrap the input payment element in a state to be modifyable from the user
  const [paymentSchedule, setPaymentSchedule] = useState(_paymentSchedule);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //Set the correct type of the input on the state payment
    if (e.target.name === "amount") {
      setPaymentSchedule({
        ...paymentSchedule,
        amount: parseInt(e.target.value)
      });

      return;
    } else if (e.target.name === "startDate") {
      setPaymentSchedule({
        ...paymentSchedule,
        startDate: new Date(e.target.value)
      });
      return;
    }
    setPaymentSchedule({
      ...paymentSchedule,
      name: e.target.value
    });
  };

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.paymentSchedule.update.useMutation({
    onSuccess: () => {
      void ctx.paymentSchedule.getAll.invalidate();
      onPaymentUpdate();
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
      <h1 className="text-2xl font-bold text-center">Update Paymentschedule</h1>
      <div className="flex flex-col gap-3">

        <div>
          <label className="block text-sm font-bold text-gray-700">Name:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="text" name="name" onChange={handleChange} value={paymentSchedule.name} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Amount:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="number" name="amount" onChange={handleChange} value={paymentSchedule.amount} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Start Date:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="date" name="startDate" onChange={handleChange} value={paymentSchedule.startDate.toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Schedule:</label>
          <select className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" name="schedule" onChange={handleChange} value={paymentSchedule.schedule}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      {
        !isPosting && (
          <button className="px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" onClick={() => mutate({ ...paymentSchedule, lastRun: paymentSchedule.lastRun || undefined })}>Post</button>
        )
      }
      {
        isPosting && (
          <div className="flex items-center justify-center mt-4 text-blue-500">
            Loading...
          </div>
        )
      }
    </div >
  );
};

const CreatePaymentSchedule = ({ onPaymentScheduleCreation }: { onPaymentScheduleCreation: () => void }) => {
  // Give me the next auth user session 
  const { data: sessionData } = useSession();

  //create a input state of type payment
  const [paymentSchedule, setPaymentSchedule] = useState({
    amount: 0,
    startDate: new Date(),
    name: '',
    schedule: 'monthly'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //Set the correct type of the input
    if (e.target.name === "amount") {
      setPaymentSchedule({
        ...paymentSchedule,
        [e.target.name]: parseInt(e.target.value)
      });

      return;
    }
    if (e.target.name === "startDate") {
      setPaymentSchedule({
        ...paymentSchedule,
        [e.target.name]: new Date(e.target.value)
      });
      return;
    }
    setPaymentSchedule({
      ...paymentSchedule,
      [e.target.name]: e.target.value
    });
  };

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.paymentSchedule.create.useMutation({
    onSuccess: () => {
      void ctx.paymentSchedule.getAll.invalidate();
      onPaymentScheduleCreation();
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
          <label className="block text-sm font-bold text-gray-700">Start Date:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="date" name="startDate" onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Schedule:</label>
          <select className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" name="schedule" onChange={handleChange}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      {
        !isPosting && (
          <button className="px-4 py-2 mt-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-700" onClick={() => mutate({ ...paymentSchedule })}>Post</button>
        )
      }
      {
        isPosting && (
          <div className="flex items-center justify-center mt-4 text-blue-500">
            Loading...
          </div>
        )
      }
    </div >
  );

}

const deletePaymentScheduleDialog = (paymentSchedule: PaymentSchedule) => {

}


const addPaymentsForSchedule = (paymentSchedule: PaymentSchedule) => {
  // Find the dates between the last run date of the schedule and now
  const lastRun = paymentSchedule.lastRun ?? paymentSchedule.startDate;
  const now = new Date();
  const dates = [];
  let date = new Date(lastRun);
  // Date is set wrong, its not the lastRun but rather the startDate + 
  while (date < now) {
    if (date > lastRun) {
      dates.push(date);
    }
    if (paymentSchedule.schedule === 'monthly') {
      //add one month to the date
      date = new Date(date.setMonth(date.getMonth() + 1));
      console.log(date)
    } else if (paymentSchedule.schedule === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
  }

  // Return if there are no dates
  if (dates.length === 0) return;

  // Add payments for each date
  const newPayments = dates.map((date) => ({
    name: paymentSchedule.name,
    amount: paymentSchedule.amount,
    "date": date,
    isRecurring: true,
    paymentScheduleId: paymentSchedule.id,
  }));

  console.log("New payments", newPayments)

  return newPayments;
};

const CreatePaymentScheduleModal = (props: { paymentSchedule?: PaymentSchedule }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handlePaymentScheduleCreation = () => {
    // Create the payment here
    // After the payment is successfully created, close the modal
    setModalIsOpen(false);
  };

  return (
    <div>
      {props.paymentSchedule ? <FaEdit onClick={() => setModalIsOpen(true)} className="text-md cursor-pointer" /> :
        <button className="text-white" onClick={() => setModalIsOpen(true)}>+ Add payment schedule</button>
      }
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Create Payment Schedule"
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
        {
          props.paymentSchedule ? <UpdatePaymentSchedule _paymentSchedule={props.paymentSchedule} onPaymentUpdate={handlePaymentScheduleCreation} /> : <CreatePaymentSchedule onPaymentScheduleCreation={handlePaymentScheduleCreation} />
        }

      </Modal>
    </div>
  );
};
const ViewPaymentSchedule = (props: { paymentSchedule: PaymentSchedule }) => {
  const amountColor = props.paymentSchedule.amount < 0 ? 'text-red-500' : 'text-green-500';
  const ArrowIcon = props.paymentSchedule.amount < 0 ? FaArrowDown : FaArrowUp;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.paymentSchedule.delete.useMutation({
    onSuccess: () => {
      void ctx.paymentSchedule.getAll.invalidate();
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
    mutate(props.paymentSchedule.id);
  }

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white transform transition-transform duration-500 hover:scale-105">
      <div className="flex justify-between items-center mb-4">


        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-md" />
          <p className="text-md">{props.paymentSchedule.startDate.toDateString()}</p>
        </div>


        <div className="flex space-x-2">
          <CreatePaymentScheduleModal paymentSchedule={props.paymentSchedule} />
          <FaTrash onClick={handleDelete} className="cursor-pointer text-red-500 text-md" />
        </div>
      </div>
      <div className="flex justify-center items-end">
        <div className="flex items-center space-x-2">
          <ArrowIcon className={`text-4xl ${amountColor}`} />
          <p className={`text-center text-6xl ${amountColor}`}>
            {Math.abs(props.paymentSchedule.amount)}
          </p>
          <p className={`text-center text-2xl ${amountColor} align-top`}>
            €
          </p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-center text-2xl">{props.paymentSchedule.name}</p>
      </div>
      <div className="space-x-2 items-center">
        <FaClock className="text-md text-center" />
        <p className="text-center">{props.paymentSchedule.schedule}</p>
      </div>
    </div>
  );
};

const ViewPayment = (props: { payment: Payment }) => {
  const { name, amount, date, paymentScheduleId } = props.payment;
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

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white transform transition-transform duration-500 hover:scale-105">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {paymentScheduleId && <FaClock className="text-md " />}
        </div>
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-md" />
          <p className="text-md">{date.toDateString()}</p>
        </div>
        <div className="flex space-x-2">
          <CreatePaymentModal payment={props.payment} />
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

const CreatePaymentModal = (props: { payment?: Payment }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handlePaymentCreation = () => {
    // Create the payment here
    // After the payment is successfully created, close the modal
    setModalIsOpen(false);
  };

  return (
    <div>
      {props.payment ? <FaEdit onClick={() => setModalIsOpen(true)} className="text-md cursor-pointer" /> :
        <button className="text-white" onClick={() => setModalIsOpen(true)}>+ Add payment</button>
      }
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
        {
          props.payment ? <UpdatePayment _payment={props.payment} onPaymentUpdate={handlePaymentCreation} /> : <CreatePayment onPaymentCreation={handlePaymentCreation} />
        }

      </Modal>
    </div>
  );
};

const CreatePayment = ({ onPaymentCreation }: { onPaymentCreation: () => void }) => {
  // Give me the next auth user session 
  const { data: sessionData } = useSession();

  //create a input state of type payment
  const [payment, setPayment] = useState({
    amount: 0,
    date: new Date(),
    name: '',
    isRecurring: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Set the correct type of the input
    if (e.target.name === "amount") {
      setPayment({
        ...payment,
        [e.target.name]: parseInt(e.target.value)
      });

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
      onPaymentCreation();
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

interface UpdatePaymentProps {
  _payment: Payment;
  onPaymentUpdate: () => void;
}

const UpdatePayment = ({ _payment, onPaymentUpdate }: UpdatePaymentProps) => {
  // Give me the next auth user session 
  const { data: sessionData } = useSession();

  //wrap the input payment element in a state to be modifyable from the user
  const [payment, setPayment] = useState(_payment);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Set the correct type of the input on the state payment
    if (e.target.name === "amount") {
      setPayment({
        ...payment,
        amount: parseInt(e.target.value)
      });

      return;
    } else if (e.target.name === "date") {
      setPayment({
        ...payment,
        date: new Date(e.target.value)
      });
      return;
    }
    setPayment({
      ...payment,
      name: e.target.value
    });
  };

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.payment.update.useMutation({
    onSuccess: () => {
      void ctx.payment.getForYear.invalidate();
      onPaymentUpdate();
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
      <h1 className="text-2xl font-bold text-center">Update Payment</h1>
      <div className="flex flex-col gap-3">

        <div>
          <label className="block text-sm font-bold text-gray-700">Name:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="text" name="name" onChange={handleChange} value={payment.name} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Amount:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="number" name="amount" onChange={handleChange} value={payment.amount} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Date:</label>
          <input className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" type="date" name="date" onChange={handleChange} value={payment.date.toISOString().slice(0, 10)} />
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
  const { data: PaymentSchedules } = api.paymentSchedule.getAll.useQuery();

  const { mutate } = api.payment.create.useMutation();
  const { mutate: mutatePaymentSchedule } = api.paymentSchedule.update.useMutation();
  useEffect(() => {
    if (PaymentSchedules) {
      // For each payment schedule, add payments to the database
      const paymentsToAdd: any[] = [];
      PaymentSchedules.forEach((paymentSchedule) => {
        const newPayments = addPaymentsForSchedule(paymentSchedule);
        if (newPayments) {
          paymentsToAdd.push(...newPayments);
        }
      });
      if (paymentsToAdd && paymentsToAdd.length > 0) {
        // Add the payments
        Promise.all(
          [paymentsToAdd.map((payment: { date: Date; name: string; amount: number; paymentScheduleId?: string | undefined; }) =>
            mutate({ ...payment })
          ), PaymentSchedules.map((paymentSchedule) =>
            mutatePaymentSchedule({ ...paymentSchedule, lastRun: new Date() })
          )]
        ).then(() => {
          console.log("done")
        });
      }
    }
  }, [PaymentSchedules])
  if (PaymentSchedules && PaymentSchedules.length > 1000) {
    // For each payment schedule, add payments to the database
    const paymentsToAdd: any[] = [];
    PaymentSchedules.forEach((paymentSchedule) => {
      const newPayments = addPaymentsForSchedule(paymentSchedule);
      if (newPayments) {
        paymentsToAdd.push(...newPayments);
      }
    });
    console.log("paymentsToAdd", paymentsToAdd)
    if (PaymentSchedules) {
      // For each payment schedule, add payments to the database
      const paymentsToAdd: any[] = [];
      PaymentSchedules.forEach((paymentSchedule) => {
        const newPayments = addPaymentsForSchedule(paymentSchedule);
        console.log(newPayments)
        if (newPayments) {
          paymentsToAdd.push(...newPayments);

        }
      });

      if (paymentsToAdd && paymentsToAdd.length > 0) {
        // Add the payments
        Promise.all(
          [paymentsToAdd.map((payment: { date: Date; name: string; amount: number; paymentScheduleId?: string | undefined; }) =>
            mutate({ ...payment })
          ), PaymentSchedules.map((paymentSchedule) =>
            mutatePaymentSchedule({ ...paymentSchedule, lastRun: new Date() })
          )]
        ).then(() => {
          console.log("done")
        });
      }
    }
  }
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: firstPayment } = api.payment.getFirstPayment.useQuery();
  const { data: payments } = api.payment.getForYear.useQuery({ year });




  // In your component
  const groupedPayments = groupByMonth(payments ?? []);
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
          {firstPayment && (
            <div>
              <p>Select year:</p>
              <select
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                onChange={(e) => setYear(parseInt(e.target.value))}
                value={year}
              >
                {
                  (() => {
                    const currentYear = new Date().getFullYear();
                    const firstYear = firstPayment!.date.getFullYear();
                    const years = [];
                    for (let i = firstYear; i <= currentYear; i++) {
                      years.push(<option key={i} value={i}>{i}</option>);
                    }
                    return years;
                  })()
                }
              </select>

            </div>)}

          <CreatePaymentModal />
          <CreatePaymentScheduleModal />

          {
            PaymentSchedules && (
              <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-4 duration-1000">
                {(PaymentSchedules as PaymentSchedule[]).map((paymentSchedule) => (
                  <ViewPaymentSchedule key={paymentSchedule.id} paymentSchedule={paymentSchedule} />
                ))}
              </div>
            )
          }

          <Accordion className="w-full">
            {Object.entries(groupedPayments).map(([month, payments]) => (
              <AccordionItem key={month} >
                <AccordionItemHeading className="bg-white rounded p-3 my-2">
                  <AccordionItemButton>
                    <span>{month}</span>
                    <span className="ml-3 text-sm text-gray-500 float-right">
                      {calculateSum(payments as Payment[])} €
                    </span>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel className="duration-1000 transition-all">
                  <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-4 duration-1000">
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

