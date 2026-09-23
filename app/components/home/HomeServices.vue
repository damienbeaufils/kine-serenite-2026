<template>
  <UCard
    id="techniques"
    class="text-center"
  >
    <div class="card-title justify-center rounded-t-[4px] bg-kine-green p-5 text-white">
      <h1 class="text-h5 font-normal sm:text-h4">
        Détail des techniques
      </h1>
    </div>
    <div class="card-text p-5 text-kine-green">
      <div class="v-row justify-center">
        <div class="v-col col-12">
          <UCard>
            <div class="card-text rounded-[4px] bg-kine-yellow text-center font-cursive text-h6 font-bold text-kine-green italic sm:text-h5">
              Je vous concocte un soin sur-mesure alliant toutes ces techniques.
            </div>
          </UCard>
        </div>

        <div class="v-col col-12">
          👇 Cliquez sur un élément pour avoir plus d'informations 👇
        </div>

        <ServiceTile
          to="/soins/massage-de-repit/"
          image="/img/services/massage_de_repit.jpg"
          :width="800"
          :height="537"
          alt=""
        >
          Massage de répit<br>(à domicile / CHSLD / hôpital)
        </ServiceTile>

        <ServiceTile
          to="/soins/orthotherapie-kinesitherapie-soin-therapeutique/"
          image="/img/services/kinesitherapie_therapeutique.jpg"
          :width="800"
          :height="565"
          alt=""
        >
          Orthothérapie - Kinésithérapie / Soin thérapeutique
        </ServiceTile>

        <ServiceTile
          to="/soins/drainage-lymphatique/"
          image="/img/services/drainage_lymphatique.jpg"
          :width="800"
          :height="531"
          alt=""
        >
          Drainage lymphatique
        </ServiceTile>

        <ServiceTile
          to="/soins/massage-femme-enceinte/"
          image="/img/services/massage_femme_enceinte.jpg"
          :width="800"
          :height="510"
          alt=""
        >
          Massage pour femme enceinte
        </ServiceTile>

        <ServiceTile
          to="/soins/massage-deep-tissue/"
          image="/img/services/massage_tissus_profonds.jpg"
          :width="800"
          :height="533"
          alt=""
        >
          Massage des tissus profonds<br class="max-lg:hidden">
          (Deep Tissue)
        </ServiceTile>

        <ServiceTile
          image="/img/services/massage_thailandais.jpg"
          :width="1280"
          :height="855"
          alt=""
        >
          Massage thaïlandais sur table
        </ServiceTile>
      </div>
    </div>
  </UCard>
</template>
