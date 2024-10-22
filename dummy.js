if (merchant.payinMode === 'DEFAULT') {
  // Both enabled
  if (merchant.allowMemberChannelsPayin && merchant.allowPgBackupForPayin) {
    // fetch member channels within a timeout
    // else fetch gateway
  }

  // memer channels disabled
  if (!merchant.allowMemberChannelsPayin) {
    // fetch payin gateway
  }

  // gateway disabled
  if (!merchant.allowPgBackupForPayin) {
    // search for member channels without timeout
  }
}

if (merchant.payinMode === 'AMOUNT RANGE') {
  const amountRanges = merchant.payinModeDetails.filter(
    (el) => el.amountRangeRange.length > 0,
  );

  amountRanges.forEach((range) => {
    console.log(range);
  });
}

if (merchant.payinMode === 'PROPORTIONAL') {
  const amountRatios = merchant.payinModeDetails.filter(
    (el) => el.proportionalRange.length > 0,
  );

  amountRatios.forEach((ratio) => {
    console.log(ratio);
  });
}

await this.payinService.updatePayinStatusToAssigned({});
