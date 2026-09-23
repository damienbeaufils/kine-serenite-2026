<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage de répit'),
  description: 'Qu’est-ce que le massage de répit ? Pour qui ? Prise de rendez-vous pour un massage de répit (pour personnes en perte d’autonomie). Uniquement à domicile / en CHSLD / à l’hôpital.',
  path: '/soins/massage-de-repit/'
})
</script>

<template>
  <ServicePage title="Massage de répit (pour personnes en perte d’autonomie) - Uniquement à domicile / en CHSLD / à l’hôpital">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage de répit ?
      </h2>

      <p>
        Il est offert uniquement pour les personnes ne pouvant s’installer
        sur une table traditionnelle de massage et leurs proches aidants.
      </p>

      <p>
        L'objectif est plutôt d’offrir un massage confortable et sécuritaire
        <b>directement dans vos installations</b>, selon vos capacités et
        vos besoins (fauteuil inclinable, chaise, divan, etc.). Ils ne
        visent pas la performance ou le traitement musculaire intensif.
      </p>

      <p>
        J’apporte avec moi le matériel nécessaire pour créer un
        environnement apaisant et adapté : une chaise longue, un appui-tête
        portatif pouvant être installé sur n’importe quelle table, une
        enceinte pour une musique douce ainsi qu’un gel de massage neutre.
        <u>Je ne me déplace pas avec une table de massage traditionnelle.</u>
      </p>

      <p>
        Chaque soin est personnalisé afin de privilégier votre confort,
        votre bien-être et le respect de vos limites.
      </p>

      <p>Je m’adapte à vous pour :</p>
      <ul>
        <li>
          <b>l’installation</b> : dans votre fauteuil roulant, une chaise
          longue, le lazyboy, dans votre divan… De mon côté, j’apporte une
          chaise longue ainsi qu’un appui-tête portatif qui se dépose sur
          n’importe quelle table.
        </li>
        <li><b>la durée du massage</b> : 15-20, 30, 45 ou 60 minutes.</li>
        <li>
          <b>vos besoins</b> : juste la tête ; ou les mains, les pieds, la
          tête et un peu de dos …
        </li>
      </ul>
      <p>En gros : vous choisissez car c’est votre moment de réconfort.</p>
    </div>

    <div class="v-col col-12 order-2 sm:col-6 sm:order-0">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <p>Ce soin s’adresse notamment aux personnes vivant avec :</p>
      <ul>
        <li>le cancer ;</li>
        <li>la SLA ;</li>
        <li>le Parkinson ;</li>
        <li>l’Alzheimer ;</li>
        <li>d’autres maladies dégénératives.</li>
      </ul>
      <p>Ainsi qu’aux personnes :</p>
      <ul>
        <li>en fauteuil roulant ;</li>
        <li>tétraplégiques ;</li>
        <li>hospitalisées ;</li>
        <li>l’en CHSLD ;</li>
        <li>en fin de vie.</li>
      </ul>

      <p>Et je n’oublie pas les proches aidants.</p>
    </div>

    <div class="v-col col-12 order-1 mx-auto my-auto sm:col-6 sm:order-0">
      <img
        src="/img/services/massage_de_repit.jpg"
        :alt="IMAGE_ALT['massage_de_repit.jpg']"
        width="800"
        height="537"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
