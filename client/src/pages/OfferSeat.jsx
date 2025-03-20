// src/pages/OfferSeat.jsx
import PublishCard from "@/components/PublishCard";

const OfferSeat = () => {
  return (
    <section>
      <h1 className="text-3xl text-center p-5 font-bold">
        <span className="text-primary">Publish</span> a <span className="text-primary">Ride</span> in Just{" "}
        <span className="text-primary">Minutes</span>
      </h1>
      <div className="container pt-6 max-w-screen-xl pb-16 mx-auto flex justify-center">
        <div className="w-full">
          <PublishCard />
        </div>
      </div>
    </section>
  );
};

export default OfferSeat;