# Phase 11.6C.2A.3 Field-Binding Repair

Selected records now use one explicit schema covering checksum, owner review, suggested/accepted/confirmed metadata, Scripture fields, translation, rights, safety, sequence membership, pilot selection, technical metadata, and warnings.

Server validation now:

- keeps `ownerReviewed` separate from `translation`;
- accepts only approved translations or `Unknown`;
- rejects generic references such as `Book 1:1-2`;
- treats suggestions as unconfirmed until an explicit owner action;
- rejects `Choose status`, unknown, blocked, and unsupported rights/safety values at the gate;
- merges successive saved fields instead of discarding prior values.

The wizard shows suggested and accepted title, description, and Scripture values separately. It supplies meaningful local Galatians suggestions where the contact sheet supports them and otherwise displays `Needs owner confirmation`. No Scripture, rights, safety, or owner-review decision is auto-confirmed.
