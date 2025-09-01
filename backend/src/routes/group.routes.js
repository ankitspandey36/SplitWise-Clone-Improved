import { Router } from 'express';
import {
    createGroup,
    addUserInGroup,
    getGroupsForUser,
    addExpenseInGroup,
    editExpenseInGroup,
    settleExpenseInGroup,
    deleteGroup,
    leaveGroup,
    saveMessage,
    getMessage,
    getGroup,
    getGroupExpense,
    markAsPaid,
    getGroupMembers,
    getPeopleWhoClearedExpense,
    removeMemberFromExpense,
    addANewMemberInExpense, getGroupIndividualExpense,
    getGroupForActivity
} from '../controllers/group.controller.js';
import { verifyjwt } from '../middlewares/verifyjwt.middleware.js';

const router = Router();

router.post('/create', verifyjwt, createGroup);

router.post('/:groupId/add-user', verifyjwt, addUserInGroup);

router.get('/get-groups', verifyjwt, getGroupsForUser);

router.post('/:groupId/add-expense', verifyjwt, addExpenseInGroup);

router.put('/:groupId/expenses/:expenseId', verifyjwt, editExpenseInGroup);

router.post('/:groupId/expenses/:expenseId/settle', verifyjwt, settleExpenseInGroup);

router.delete('/:groupId/delete', verifyjwt, deleteGroup);

router.post('/:groupId/leave-group', verifyjwt, leaveGroup);

router.post('/:groupId/save-message', verifyjwt, saveMessage);

router.get('/:groupId/get-message', verifyjwt, getMessage);

router.get('/:groupId/get-group', verifyjwt, getGroup);

router.get('/:groupId/get-group-expenses', verifyjwt, getGroupExpense);

router.patch('/:groupId/expenses/:expenseId/settle', verifyjwt, markAsPaid);

router.get('/:groupId/get-members', verifyjwt, getGroupMembers);

router.get('/:groupId/:expenseId/get-cleared-expense', verifyjwt, getPeopleWhoClearedExpense);

router.patch('/:groupId/expenses/:expenseId/remove-user', verifyjwt, removeMemberFromExpense);

router.patch('/:groupId/expenses/:expenseId/add-user', verifyjwt, addANewMemberInExpense);


router.get('/:groupId/expenses/:expenseId', verifyjwt, getGroupIndividualExpense);

router.get('/activity', verifyjwt, getGroupForActivity);




export default router;
