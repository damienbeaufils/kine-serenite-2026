<script setup lang="ts">
const tableRates = [
  {
    duration: '60 min',
    description: 'Massage sur table où vous êtes confortablement allongé sur le ventre puis sur le dos tout au long de la séance - à la clinique de Physiothérapie France Roy ou à mon bureau à Clermont.',
    price: '90 $'
  }
]

const homeRates = [
  { duration: '15-20 min', description: 'Un premier pas tout en douceur, pour apprivoiser le toucher à votre rythme.', price: '40 $' },
  { duration: '30 min', description: 'Un moment de présence et de détente, là où vous en êtes aujourd’hui.', price: '55 $' },
  { duration: '45 min', description: 'Du temps pour vraiment prendre soin de vous, sans se presser.', price: '80 $' },
  { duration: '60 min', description: 'Une heure entière pour s’abandonner, laisser le corps se relâcher pleinement.', price: '110 $' }
]
</script>

<template>
  <div>
    <InfoCard
      title="Les types de soin offerts"
      class="mt-10"
    >
      <div class="card-text text-kine-green sm:px-15">
        <div class="mb-6 sm:mx-5">
          <UCard>
            <div class="card-text mb-3 rounded-[4px] bg-kine-yellow py-3 text-center font-bold text-kine-green">
              Massage professionnel réalisé sur table de massage
            </div>
          </UCard>
          <p>
            À la clinique de Physiothérapie France Roy ou à mon bureau à
            Clermont.
            <br>
            C’est un soin combinant des techniques de massage suédois, tissus
            profonds et thaïlandais sur table.
          </p>
          <p class="font-bold">
            L’objectif est de favoriser le relâchement des tensions et de
            promouvoir un état de détente.
          </p>
        </div>

        <div class="my-5 sm:mx-5">
          <UCard>
            <div class="card-text mb-3 rounded-[4px] bg-kine-yellow py-3 text-center font-bold text-kine-green">
              Massage de confort adapté aux personnes en perte d’autonomie,
              offert à domicile, en CHSLD ou à l’hôpital -<br class="max-lg:hidden">
              <i>ce soin ne se donne pas sur une table de massage</i>
            </div>
          </UCard>
          <p>
            C’est un soin de confort dans une <u>installation adaptée</u> (dans
            votre fauteuil, une chaise longue, etc.), alliés à des mobilisations
            douces - <i>des mouvements guidés des bras, des jambes</i> - visant
            à préserver la souplesse, encourager le mouvement et relâcher les
            tensions.
          </p>
          <p class="font-bold">
            Le but est surtout de vous déposer et de vous reconnecter avec
            vous-même, juste le temps du soin.
          </p>
          <p>
            Plus de détail en cliquant ici :&nbsp;<NuxtLink
              class="font-bold text-inherit underline"
              to="/soins/massage-de-repit/"
            >Massage de répit</NuxtLink>
          </p>
        </div>
      </div>
    </InfoCard>

    <InfoCard
      title="Tarifs"
      class="mt-10"
    >
      <div class="card-text text-center text-kine-green">
        <UCard class="my-5 sm:mx-15">
          <div class="card-title mt-1 justify-center text-center font-bold text-kine-green italic">
            <div>
              Massage professionnel réalisé sur table de massage<br class="max-lg:hidden">
              <small class="text-vuetify-red">(je ne prends plus de nouveaux clients jusqu’à nouvel
                ordre)</small>
            </div>
          </div>

          <div class="card-text pt-0 text-kine-green">
            <RatesTable :rows="tableRates" />
          </div>
        </UCard>

        <UCard class="sm:mx-15 sm:my-5">
          <div class="card-title mt-1 justify-center text-center font-bold text-kine-green italic">
            Massage adapté à domicile – approche centrée sur l'humain
          </div>

          <div class="card-text pt-0 text-kine-green">
            <RatesTable :rows="homeRates" />
          </div>

          <div class="card-text pt-0">
            <UCard class="shadow-none! sm:mx-5">
              <div class="card-text text-left text-kine-green">
                <p class="mb-1 font-bold">
                  Frais de déplacement en sus
                </p>
                <p class="mb-1">
                  <span class="font-bold">10 $</span> - Clermont,
                  St-Agnès, Pointe-au-Pic, Cap-à-l’Aigle
                </p>
                <p class="mb-1">
                  <span class="font-bold">20 $</span> - St-Fidèle,
                  St-Hilarion, Notre-Dame-des-Monts, St-Aimé-des-Lacs
                </p>
                <p class="mb-0">
                  <span class="font-bold">30 $</span> - Baie-Saint-Paul,
                  St-Siméon, Les Éboulements, St-Irénée
                </p>
              </div>
            </UCard>
          </div>
        </UCard>

        <p class="mt-3 italic sm:mt-0">
          Reçus disponibles en massothérapie, kinésithérapie et orthothérapie
          pour fins d’assurances
        </p>
        <p>
          <a
            href="https://rmpq.ca/repertoire-des-membres/clermont/virginie-dang-778809/"
            target="_blank"
            class="text-inherit no-underline"
          >
            <img
              src="/img/rmpq.jpg"
              alt="Membre du Réseau des massothérapeutes professionnels du Québec (RMPQ)"
              width="728"
              height="90"
              loading="lazy"
              decoding="async"
              class="mx-auto block h-auto w-full max-w-[500px]"
            >
          </a>
        </p>
      </div>
    </InfoCard>

    <div class="v-row">
      <div class="v-col col-12 sm:col-6">
        <InfoCard
          title="Lundi, mercredi, jeudi"
          class="mt-10"
        >
          <div class="card-subtitle mt-1 text-center font-bold text-kine-green underline">
            Clinique de physiothérapie France Roy
          </div>

          <div class="card-text justify-center pb-0 text-center text-kine-green">
            <p>
              425 Bd de Comporté, La Malbaie, QC G5A 1W5
              <br>
              <a
                class="text-inherit underline"
                href="https://www.physiotherapiefranceroy.com/"
                target="_blank"
              >physiotherapiefranceroy.com</a>
            </p>

            <p>
              <span class="font-bold">Horaires :</span>
              <br>
              Lundi & mercredi - 14h30 à 19h45 (dernier à 18h45)
              <br>
              Jeudi - 09h30 à 14h45 (dernier à 13h45)
            </p>
          </div>

          <div class="card-actions justify-center pb-2 text-center text-kine-green">
            <p>
              <span class="font-bold">Prendre rendez-vous :</span>
              <br>
              Appelez au <a
                class="text-inherit no-underline"
                href="tel:4186653980"
              >(418) 665-3980</a> directement
              à la clinique de physiothérapie pour un rendez-vous.
            </p>
          </div>
        </InfoCard>
      </div>

      <div class="v-col col-12 sm:col-6">
        <InfoCard
          title="Mardi"
          class="mt-5 sm:mt-10"
        >
          <div class="card-subtitle mt-1 text-center text-kine-green">
            <p class="mb-3 font-bold underline">
              Je pratique chez nous les mardis.
            </p>
            <p class="mb-2 font-bold text-vuetify-red">
              Non adapté pour les personnes à mobilité réduite
            </p>
          </div>

          <div class="card-text justify-center pb-0 text-center text-kine-green">
            <p>2 rue Beauregard, Clermont, QC G4A 0A2</p>
            <p>
              <span class="font-bold">Horaires :</span>
              <br>
              Mardi - 09h00 à 17h30 (dernier à 16h30)
            </p>
          </div>

          <div class="card-actions justify-center pb-2 text-center text-kine-green">
            <p>
              <span class="font-bold">Prendre rendez-vous :</span>
              <br>
              Appelez au <a
                class="text-inherit no-underline"
                href="tel:4187901294"
              >(418) 790-1294</a> ou sur
              Gorendezvous :
              <a
                class="text-inherit underline"
                href="https://www.gorendezvous.com/virginiedang"
                target="_blank"
              >gorendezvous.com/virginiedang</a>
            </p>
          </div>
        </InfoCard>
      </div>

      <div class="v-col col-12 mx-auto sm:col-6">
        <InfoCard
          class="mt-5 sm:mt-10"
          title-class="text-center"
        >
          <template #title>
            À domicile / en CHSLD / à l’hôpital -
            <br class="max-lg:hidden">sur demande
          </template>

          <div class="card-text mt-1 text-center text-kine-green">
            <p>
              Offert uniquement pour les personnes en perte d’autonomie ne
              pouvant recevoir un massage sur une table traditionnelle et leurs
              proches aidants.
            </p>
          </div>

          <div class="card-actions justify-center pb-5 text-center text-kine-green">
            <div>
              <p class="mb-2 font-bold">
                Écrivez-moi via :
              </p>
              <ul class="text-left sm:ml-5 [&>li]:mb-1 [&>li]:break-all">
                <li>
                  Facebook Messenger :
                  <a
                    class="text-inherit underline"
                    href="https://www.facebook.com/virginiedang.massotherapeute"
                    target="_blank"
                  >facebook.com/virginiedang.massotherapeute</a>
                </li>
                <li>
                  Par courriel :
                  <a
                    class="text-inherit underline"
                    href="mailto:virginiedang.massotherapeute@gmail.com"
                    target="_blank"
                  >virginiedang.massotherapeute@gmail.com</a>
                </li>
                <li>
                  Par téléphone (laissez-moi un message vocal) :
                  <a
                    class="text-inherit underline"
                    href="tel:4187901294"
                    target="_blank"
                  >(418) 790-1294</a>
                </li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  </div>
</template>
