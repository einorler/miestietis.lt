<?php
namespace Miestietis\MainBundle\Services;

use Doctrine\Common\Collections\ArrayCollection;

class Count {

    /**
     * problemCommentCount
     * @param array $items
     * @return array
     */
    public function problemCommentCount($items) {
        //$return =$items[3]->getComments()->count();
        $commentCount = [];
        foreach ($items as $item) {
       //     $commentCount[$item->getId()] = $item->getComments()->count();
            $commentCount[$item->getId()] = count($item->getComments());
        }
        return $commentCount;
    }
    /**
     * initiativeCommentCount
     * @param array $items
     * @return array
     */
    public function initiativeCommentCount($items) {
        $commentCount = [];
        foreach ($items as $item) {
            $commentCount[$item->getId()] = count($item->getProblemId()->getComments());
        }
        return $commentCount;
    }
    /**
     * joinCount
     * @param array $items
     * @return array
     */
    public function joinCount($items) {
        $joinCount = [];
        foreach ($items as $item) {
            $joinCount[$item->getId()] = $item->getParticipants()->count();
        }
        return $joinCount;
    }


}