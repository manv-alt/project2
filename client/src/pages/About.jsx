import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Truck, ShieldCheck, Users } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Fresh Quality",
    desc: "We source farm‑fresh groceries daily to ensure the best quality and taste.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Quick and reliable doorstep delivery with real‑time tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Service",
    desc: "Secure payments and trusted by thousands of happy customers.",
  },
  {
    icon: Users,
    title: "Customer First",
    desc: "Our support team is always ready to help you anytime.",
  },
];
const About = () => {
  
  return (
     <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* HERO */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900"
        >
          About Our Grocery Store
        </motion.h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          We deliver fresh groceries straight from farms to your doorstep. Our
          mission is to make healthy living easy, affordable, and convenient
          for everyone.
        </p>
      </section>

      {/* STORY SECTION */}
      <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          src="/img3.png"
          alt="Fresh groceries"
          className="rounded-2xl shadow-xl w-full"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Our Story
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Started with a simple idea — bringing fresh and affordable groceries
            to every household. We partner with trusted farmers and suppliers
            to ensure quality products reach your kitchen every day. Our goal is
            to create a seamless shopping experience with fast delivery and
            excellent customer service.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Us
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="rounded-2xl shadow-md hover:shadow-xl transition">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      <Icon className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold">Fresh Groceries Await You</h2>
        <p className="mt-3 text-green-100">
          Experience the easiest way to shop groceries online.
        </p>
      </section>
    </div>
  );
};

export default About;







 
